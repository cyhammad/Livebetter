import sendGridMail from "@sendgrid/mail";
import {
  captureException,
  captureMessage,
  flush,
  withSentry,
} from "@sentry/nextjs";
import { format } from "date-fns";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import twilio from "twilio";

import { getRandomNumber } from "lib/getRandomNumber";
import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { db } from "lib/server/db";
import { findRestaurant } from "lib/server/findRestaurant";
import { getOrderEmail } from "lib/server/getOrderEmail";
import { getReceiptEmail } from "lib/server/getReceiptEmail";
import type { ApiErrorResponse, PaymentIntentOrder } from "types";

interface LoyaltyVisit {
  date: string;
  restaurantName: string;
  visits: number;
}

export const config = { api: { bodyParser: false } };

const getPaymentIntentOrderDoc = async (event: Stripe.Event) => {
  const paymentIntentObject = event.data.object as { id: string };
  const paymentIntentId =
    "id" in paymentIntentObject ? paymentIntentObject.id : "";

  return await getDoc(doc(db, "payment_intent_orders", paymentIntentId));
};

const handlePreSuccessEvent = async (event: Stripe.Event) => {
  const paymentIntentOrderDoc = await getPaymentIntentOrderDoc(event);

  if (paymentIntentOrderDoc && paymentIntentOrderDoc.exists()) {
    const paymentIntentOrderDocRef = doc(
      db,
      "payment_intent_orders",
      paymentIntentOrderDoc.id
    );

    const status = event.type.split(".")[1];

    // Update our status if any of the above fail
    await setDoc(
      paymentIntentOrderDocRef,
      { status, updatedAt: Timestamp.now() },
      { merge: true }
    );
  } else {
    captureMessage(
      `Failed to find and update payment intent order doc during "${event.type}" event`,
      {
        extra: { event: JSON.stringify(event) },
      }
    );
  }
};

/**
 * This is a webhook that can only (reasonably) be tested within the dev
 * environment. Checkout the `dev` branch, make your changes there, then push
 * that up and test the changes again before pushing them to the `main`
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiErrorResponse | { received: boolean }>
) {
  const stripeSignature = req.headers["stripe-signature"] ?? "";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
    typescript: true,
  });

  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

  let event;

  try {
    const reqBuffer = await buffer(req);

    event = stripe.webhooks.constructEvent(
      reqBuffer,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    captureException(err);

    await flush(2000);

    res.status(400).json(createApiErrorResponse(err));

    return;
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.amount_capturable_updated":
    case "payment_intent.canceled":
    case "payment_intent.created":
    case "payment_intent.payment_failed":
    case "payment_intent.processing":
    case "payment_intent.requires_action":
    case "payment_intent.partially_funded": {
      try {
        await handlePreSuccessEvent(event);
      } catch (err) {
        captureException(err, {
          extra: {
            message: `Failed to update payment intent order doc during "${event.type}" event`,
            event,
          },
        });

        await flush(2000);

        res.status(500).json(createApiErrorResponse(err));

        return;
      }

      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntentOrderDoc = await getPaymentIntentOrderDoc(event);

      if (paymentIntentOrderDoc && paymentIntentOrderDoc.exists()) {
        const paymentIntentOrder =
          paymentIntentOrderDoc.data() as PaymentIntentOrder;
        const { didOptInToLoyaltyProgramWithThisOrder, order: newOrderData } =
          paymentIntentOrder;

        newOrderData.charges_id = paymentIntentOrderDoc.id;
        newOrderData.created_at = Timestamp.now();

        // Move the order to the `orders` collection
        const orderDoc = await addDoc(
          collection(
            db,
            process.env.VERCEL_ENV === "production" ? "orders" : "__dev_orders"
          ),
          newOrderData
        );

        // Delete the payment intent order
        await deleteDoc(
          doc(db, "payment_intent_orders", paymentIntentOrderDoc.id)
        );

        let shouldAwardLoyaltyPoint = false;

        try {
          if (
            newOrderData.deliver_to.phoneNumber &&
            newOrderData.restaurant_id
          ) {
            const phoneNumber = getTenDigitPhoneNumber(
              newOrderData.deliver_to.phoneNumber
            );
            const restaurantName = newOrderData.restaurant_id;
            const restaurantDoc = await findRestaurant(restaurantName);
            const restaurant = restaurantDoc ? restaurantDoc.data() : null;

            const existingLoyaltyDoc = await getDoc(
              doc(
                db,
                "users-with-loyalty-program",
                `${phoneNumber}-${restaurantName}`
              )
            );

            if (
              restaurant &&
              restaurant.loyaltyProgramAvailable &&
              (existingLoyaltyDoc.exists() ||
                didOptInToLoyaltyProgramWithThisOrder)
            ) {
              const nextLoyaltyData = existingLoyaltyDoc.exists()
                ? existingLoyaltyDoc.data()
                : {
                    created_at: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    phoneNumber,
                    points: 0,
                    restaurantName,
                  };

              // First, we check if the customer received a discount for this
              // order. If so, we deduct the loyalty points needed for that
              // discount
              const didReceiveDiscount =
                nextLoyaltyData.points >= (restaurant.discountUpon ?? Infinity);

              if (didReceiveDiscount) {
                nextLoyaltyData.points -= restaurant.discountUpon ?? 0;
                nextLoyaltyData.updatedAt = Timestamp.now();
              }

              // Next, we check if we should award the customer a point for this
              // order, and add the point if so.
              shouldAwardLoyaltyPoint =
                (newOrderData.subTotal ?? 0) >=
                (restaurant.threshold ?? Infinity);

              if (shouldAwardLoyaltyPoint) {
                nextLoyaltyData.points++;
                nextLoyaltyData.updatedAt = Timestamp.now();

                const loyaltyVisitsDate = format(new Date(), "yyyy-MM-dd");

                const existingLoyaltyVisitsDoc = await getDoc(
                  doc(
                    db,
                    process.env.VERCEL_ENV === "production"
                      ? "restaurant-loyalty-visits"
                      : "__dev_restaurant-loyalty-visits",
                    `${restaurantName}-${loyaltyVisitsDate}`
                  )
                );

                const nextLoyaltyVisits: LoyaltyVisit =
                  existingLoyaltyVisitsDoc && existingLoyaltyVisitsDoc.exists()
                    ? (existingLoyaltyVisitsDoc.data() as LoyaltyVisit)
                    : { date: loyaltyVisitsDate, restaurantName, visits: 0 };

                nextLoyaltyVisits.visits++;

                await setDoc(
                  doc(
                    db,
                    process.env.VERCEL_ENV === "production"
                      ? "restaurant-loyalty-visits"
                      : "__dev_restaurant-loyalty-visits",
                    `${restaurantName}-${loyaltyVisitsDate}`
                  ),
                  nextLoyaltyVisits
                );
              }

              await setDoc(
                doc(
                  db,
                  "users-with-loyalty-program",
                  `${phoneNumber}-${restaurantName}`
                ),
                nextLoyaltyData
              );

              let message = "";
              let mediaUrl: string | undefined;
              const points = nextLoyaltyData.points;
              const pointsPluralized = `point${points !== 1 ? "s" : ""}`;
              const pointsTilNextReward =
                (restaurant.discountUpon ?? 0) - points;
              const pointsTilNextRewardPluralized = `point${
                pointsTilNextReward !== 1 ? "s" : ""
              }`;
              const thresholdFormatted = restaurant.threshold?.toFixed(2);
              const discountFormatted = restaurant.discountAmount?.toFixed(2);
              const firstName = newOrderData.deliver_to.firstName;

              if (didOptInToLoyaltyProgramWithThisOrder) {
                message = `Welcome to ${restaurantName}'s Delivery Rewards Program! You currently have ${points} ${pointsPluralized}. Each time you spend more than $${thresholdFormatted} on a single order you gain 1 point! You are only ${pointsTilNextReward} ${pointsTilNextRewardPluralized} away from receiving $${discountFormatted} off!`;
              } else if (shouldAwardLoyaltyPoint) {
                const shouldSeeRewardGif =
                  typeof restaurant.discountUpon === "number" &&
                  nextLoyaltyData.points === restaurant.discountUpon - 1;
                const willReceiveDiscountNextPoint =
                  nextLoyaltyData.points >=
                  (restaurant.discountUpon ?? Infinity);

                mediaUrl = shouldSeeRewardGif
                  ? `https://www.livebetterphl.com/reward-${getRandomNumber(
                      1,
                      5
                    )}.gif`
                  : undefined;

                if (willReceiveDiscountNextPoint) {
                  message = `Congrats ${firstName}! You just earned your reward. On your next order from ${restaurantName}, you will receive $${discountFormatted} off!`;
                } else {
                  message = `Hey there, ${firstName}. You just racked up a point with ${restaurantName}! You now have ${points} ${pointsPluralized}. You are only ${pointsTilNextReward} ${pointsTilNextRewardPluralized} away from receiving $${discountFormatted} off!`;
                }
              }

              if (message) {
                await twilioClient.messages.create({
                  to: phoneNumber,
                  from: "+18782313212",
                  body: message,
                  mediaUrl,
                });
              }
            }
          }
        } catch (err) {
          captureException(err, {
            extra: {
              message: `Failed to assign loyalty points for order ${orderDoc.id}`,
            },
          });
        }

        const orderEmailHtml = getOrderEmail(
          newOrderData,
          shouldAwardLoyaltyPoint
        );

        const receiptEmailHtml = await getReceiptEmail({
          order: newOrderData,
          orderId: orderDoc.id,
          paymentIntentId: newOrderData.charges_id,
        });

        const [orderEmailResponse, receiptEmailResponse] =
          await Promise.allSettled([
            await sendGridMail.send({
              from: "livebetterphl@gmail.com",
              to:
                process.env.VERCEL_ENV === "production"
                  ? "livebetterphl@gmail.com"
                  : "testorders4@gmail.com",
              subject: `New Order Notification ✔ (Order #${orderDoc.id})`,
              html: orderEmailHtml,
              headers: { Accept: "application/json" },
            }),
            await sendGridMail.send({
              from: "livebetterphl@gmail.com",
              to: newOrderData.deliver_to.email,
              subject: `LiveBetter receipt`,
              html: receiptEmailHtml,
              headers: { Accept: "application/json" },
            }),
          ]);

        const didOrderEmailFail = orderEmailResponse.status === "rejected";
        const didReceiptEmailFail = receiptEmailResponse.status === "rejected";

        if (didOrderEmailFail) {
          captureException(orderEmailResponse.reason, {
            extra: {
              message: "Failed to send order email using SendGrid",
            },
          });
        }

        if (didReceiptEmailFail) {
          captureException(receiptEmailResponse.reason, {
            extra: {
              message: "Failed to send receipt email using SendGrid",
            },
          });
        }
      } else {
        captureMessage(
          `Failed to find and update payment intent order doc during "${event.type}" event`,
          {
            extra: { event: JSON.stringify(event) },
          }
        );
      }

      break;
    }
    default:
      // Do nothing;
      break;
  }

  await flush(2000);

  res.status(200).json({
    received: true,
  });
}

export default withSentry(handler);
