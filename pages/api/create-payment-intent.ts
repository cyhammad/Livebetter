import { withSentry } from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { getCartPaymentIntentInfo } from "lib/server/getCartPaymentIntentInfo";
import type {
  CreatePaymentIntentCart,
  GetCreatePaymentIntentResult,
} from "types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
  typescript: true,
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetCreatePaymentIntentResult>
) {
  const cart: CreatePaymentIntentCart = req.body.cart;

  const { amount } = getCartPaymentIntentInfo(cart);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    automatic_payment_methods: {
      enabled: true,
    },
    currency: "usd",
  });

  const result: GetCreatePaymentIntentResult = {
    clientSecret: paymentIntent.client_secret,
  };

  res.status(200).json(result);
}

export default withSentry(handler);
