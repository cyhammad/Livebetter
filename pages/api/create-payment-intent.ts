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
import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
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
      apiVersion: "2022-08-01",
      typescript: true,
    });

    // Remove non-digits from the user's phone number before saving
    user.phoneNumber = getTenDigitPhoneNumber(user.phoneNumber);

    const lastOrderDocFromEmail = await getDocs(
      query(
        collection(
          db,
          process.env.VERCEL_ENV === "production" ? "orders" : "__dev_orders"
        ),
        where("customers_id", ">=", "cus_"),
        where("deliver_to.email", "==", user.email),
        limit(1)
      )
    );

    const lastOrderFromEmail =
      lastOrderDocFromEmail.docs[0]?.data() as Order | null;

    let customerId = lastOrderFromEmail?.customers_id;

    /**
     * Attempt to find the customer id in previous payment intent orders
     */
    if (!customerId) {
      const lastPaymentIntentOrderDocFromEmail = await getDocs(
        query(
          collection(db, "payment_intent_orders"),
          where("order.deliver_to.email", "==", user.email),
          limit(1)
        )
      );

      const lastPaymentIntentOrderFromEmail =
        lastPaymentIntentOrderDocFromEmail.docs[0]?.data() as PaymentIntentOrder | null;

      if (lastPaymentIntentOrderFromEmail) {
        customerId = lastPaymentIntentOrderFromEmail.order.customers_id;
      }
    }

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

    const {
      amount,
      subtotal,
      total,
      deliveryFee,
      serviceFee,
      tax,
      smallOrderFee,
      processingFee,
    } = getCartPricingBreakdown({
      items: cart.items,
      shippingMethod: user.shippingMethod,
      tip: cart.tip,
      distance: cart.distance,
      discount,
    });

    const order = createOrder({
      cart,
      customerId,
      deliveryFee,
      discount,
      processingFee,
      serviceFee,
      smallOrderFee,
      subtotal,
      tax,
      tip: cart.tip,
      total,
      user,
      waitTime: restaurant?.waitTime,
    });

    const paymentIntentOrder: PaymentIntentOrder = {
      didOptInToLoyaltyProgramWithThisOrder:
        cart.didOptInToLoyaltyProgramWithThisOrder,
      order,
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
        /**
         * Full statement descriptor cannot be more than 22 characters. We have
         * a static statement descriptor of LIVEBETTER (10 chars), so our suffix
         * can only be 12 characters. We also remove all non-letters and non-
         * spaces to be compatible with statement descriptor requirements
         * @see https://stripe.com/docs/account/statement-descriptors#requirements
         */
        statement_descriptor_suffix: cart.restaurantName
          .replace(/[^a-zA-Z ]/g, "")
          .slice(0, 12),
      });
    }

    await setDoc(
      doc(db, "payment_intent_orders", paymentIntent.id),
      paymentIntentOrder,
      { merge: true }
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
