import { captureException, flush, withSentry } from "@sentry/nextjs";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { getCartPricingBreakdown } from "lib/getCartPricingBreakdown";
import { getNormalizedPhoneNumber } from "lib/getNormalizedPhoneNumber";
import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { createOrder } from "lib/server/createOrder";
import { db } from "lib/server/db";
import { findRestaurant } from "lib/server/findRestaurant";
import { reassignCartPrices } from "lib/server/reassignCartPrices";
import type {
  ApiErrorResponse,
  CreatePaymentIntentRequestBody,
  CreatePaymentIntentResult,
  Order,
  PaymentIntentOrder,
  UserWithLoyaltyProgram,
} from "types";

interface CreatePaymentIntentRequest extends NextApiRequest {
  body: Partial<CreatePaymentIntentRequestBody>;
}

async function handler(
  req: CreatePaymentIntentRequest,
  res: NextApiResponse<CreatePaymentIntentResult | ApiErrorResponse>
) {
  try {
    const cart = req.body.cart;
    const user = req.body.user;

    if (!cart) {
      return res
        .status(400)
        .json(
          createApiErrorResponse("Missing `cart` property in request body")
        );
    }

    if (!user) {
      return res
        .status(400)
        .json(
          createApiErrorResponse("Missing `user` property in request body")
        );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2020-08-27",
      typescript: true,
    });

    // Remove non-digits from the user's phone number before saving
    user.phoneNumber = getNormalizedPhoneNumber(user.phoneNumber);

    const lastOrderDocFromEmail = await getDocs(
      query(
        collection(db, "orders"),
        where("deliver_to.email", "==", user.email),
        limit(1)
      )
    );

    const lastOrderFromEmail =
      lastOrderDocFromEmail.docs[0]?.data() as Order | null;

    let customerId = lastOrderFromEmail?.customers_id;

    if (!customerId) {
      const customerCreateParams: Stripe.CustomerCreateParams = {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phoneNumber,
      };

      const customer = await stripe.customers.create(customerCreateParams);

      customerId = customer.id;
    }

    await reassignCartPrices(cart);

    const restaurantDoc = await findRestaurant(cart.restaurantName);
    const restaurant = restaurantDoc ? restaurantDoc.data() : null;

    let discount = 0;

    if (restaurant && restaurant.loyaltyProgramAvailable) {
      const existingLoyaltyDoc = await getDoc(
        doc(
          db,
          "users-with-loyalty-program",
          `${user.phoneNumber}-${cart.restaurantName}`
        )
      );

      if (existingLoyaltyDoc.exists()) {
        const userWithLoyaltyProgram =
          existingLoyaltyDoc.data() as UserWithLoyaltyProgram;

        if (
          userWithLoyaltyProgram.points >= (restaurant.discountUpon ?? Infinity)
        ) {
          discount = restaurant.discountAmount ?? 0;
        }
      }
    }

    const { amount, subtotal, total } = getCartPricingBreakdown(
      cart.items,
      user.shippingMethod,
      cart.tip,
      discount
    );

    const order = createOrder(
      cart,
      user,
      customerId,
      subtotal,
      discount,
      cart.tip,
      total
    );

    const paymentIntentOrder: PaymentIntentOrder = {
      didOptInToLoyaltyProgramWithThisOrder:
        cart.didOptInToLoyaltyProgramWithThisOrder,
      order,
      status: null,
      updatedAt: Timestamp.now(),
    };

    let paymentIntent;

    // If a payment intent client secret is passed we can use that to update the
    // existing payment intent, rather than creating a new one.
    if (cart.paymentIntentClientSecret) {
      // Not sure if this is okay or not, but the payment intent id is everything
      // before _secret_ in the client secret
      const paymentIntentId =
        cart.paymentIntentClientSecret.split("_secret_")[0];

      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount,
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        automatic_payment_methods: {
          enabled: true,
        },
        currency: "usd",
        customer: customerId,
        description: `Order from ${cart.restaurantName} created by ${user.email}`,
        setup_future_usage: "off_session",
        receipt_email: user.email,
      });
    }

    await setDoc(
      doc(db, "payment_intent_orders", paymentIntent.id),
      paymentIntentOrder
    );

    const result: CreatePaymentIntentResult = {
      clientSecret: paymentIntent.client_secret,
    };

    res.status(200).json(result);
  } catch (err) {
    captureException(err);

    await flush(2000);

    res.status(500).json(createApiErrorResponse(err));
  }
}

export default withSentry(handler);
