import { withSentry } from "@sentry/nextjs";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { getCartPricingBreakdown } from "lib/getCartPricingBreakdown";
import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { createOrder } from "lib/server/createOrder";
import { db } from "lib/server/db";
import { reassignCartPrices } from "lib/server/reassignCartPrices";
import type {
  ApiErrorResponse,
  CreatePaymentIntentRequestBody,
  GetCreatePaymentIntentResult,
  Order,
  PaymentIntentOrder,
} from "types";

interface CreatePaymentIntentRequest extends NextApiRequest {
  body: Partial<CreatePaymentIntentRequestBody>;
}

async function handler(
  req: CreatePaymentIntentRequest,
  res: NextApiResponse<GetCreatePaymentIntentResult | ApiErrorResponse>
) {
  const cart = req.body.cart;
  const user = req.body.user;

  if (!cart) {
    return res
      .status(400)
      .json(createApiErrorResponse("Missing `cart` property in request body"));
  }

  if (!user) {
    return res
      .status(400)
      .json(createApiErrorResponse("Missing `user` property in request body"));
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
    typescript: true,
  });

  const lastOrderDocFromEmail = await getDocs(
    query(
      collection(db, "orders"),
      where("deliver_to.email", "==", user.email),
      limit(1)
    )
  );

  const lastOrderFromEmail = lastOrderDocFromEmail.docs[0]?.data() as Order;

  let customerId = lastOrderFromEmail.customers_id;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });

    customerId = customer.id;
  }

  await reassignCartPrices(cart);

  const { amount, subtotal, total } = getCartPricingBreakdown(
    cart.items,
    user.shippingMethod,
    cart.tip
  );

  const paymentIntent = await stripe.paymentIntents.create({
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

  const order = createOrder(cart, user, customerId, subtotal, cart.tip, total);

  const paymentIntentOrder: PaymentIntentOrder = {
    createdAt: Timestamp.now(),
    order,
    paymentIntentId: paymentIntent.id,
    status: null,
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, "payment_intent_orders"), paymentIntentOrder);

  const result: GetCreatePaymentIntentResult = {
    clientSecret: paymentIntent.client_secret,
  };

  res.status(200).json(result);
}

export default withSentry(handler);
