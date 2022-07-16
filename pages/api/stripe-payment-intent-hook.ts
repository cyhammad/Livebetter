import sendGridMail from "@sendgrid/mail";
import { captureException, withSentry } from "@sentry/nextjs";
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

import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { db } from "lib/server/db";
import { getOrderEmail } from "lib/server/getOrderEmail";
import type { ApiErrorResponse, PaymentIntentOrder } from "types";

export const config = { api: { bodyParser: false } };

const getPaymentIntentOrderDoc = async (event: Stripe.Event) => {
  const paymentIntentObject = event.data.object as { id: string };
  const paymentIntentId =
    "id" in paymentIntentObject ? paymentIntentObject.id : "";

  return await getDoc(doc(db, "payment_intent_orders", paymentIntentId));
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiErrorResponse | { received: boolean }>
) {
  const stripeSignature = req.headers["stripe-signature"] ?? "";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
    typescript: true,
  });

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
    res.status(400).json(createApiErrorResponse(err));

    return;
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.canceled":
    case "payment_intent.created":
    case "payment_intent.payment_failed":
    case "payment_intent.processing": {
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
      }

      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntentOrderDoc = await getPaymentIntentOrderDoc(event);

      if (paymentIntentOrderDoc && paymentIntentOrderDoc.exists()) {
        const paymentIntentOrder =
          paymentIntentOrderDoc.data() as PaymentIntentOrder;
        const newOrderData = paymentIntentOrder.order;

        newOrderData.charges_id = paymentIntentOrderDoc.id;
        newOrderData.created_at = Timestamp.now();

        // Move the order to the `orders` collection
        const order = await addDoc(collection(db, "orders"), newOrderData);

        // Delete the payment intent order
        await deleteDoc(
          doc(db, "payment_intent_orders", paymentIntentOrderDoc.id)
        );

        const orderEmailHtml = getOrderEmail(newOrderData);

        const [sendGridResponse] = await Promise.allSettled([
          await sendGridMail.send({
            from: "livebetterphl@gmail.com",
            to:
              process.env.NODE_ENV === "production"
                ? "livebetterphl@gmail.com"
                : "atdrago@gmail.com",
            subject: `New Order Notification ✔ (Order #${order.id})`,
            html: orderEmailHtml,
            headers: { Accept: "application/json" },
          }),
        ]);

        const didSendGridFail = sendGridResponse.status === "rejected";

        if (didSendGridFail) {
          captureException(sendGridResponse.reason, {
            extra: {
              message: "Failed to send email using SendGrid",
            },
          });
        }
      }

      break;
    }
    default:
      // Do nothing;
      break;
  }

  res.status(200).json({ received: true });
}

export default withSentry(handler);
