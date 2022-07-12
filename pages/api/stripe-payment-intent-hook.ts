import { withSentry } from "@sentry/nextjs";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { db } from "lib/server/db";
import type { ApiErrorResponse, PaymentIntentOrder } from "types";

export const config = { api: { bodyParser: false } };

const getPaymentIntentOrderDoc = async (event: Stripe.Event) => {
  const paymentIntentObject = event.data.object as { id: string };
  const paymentIntentId =
    "id" in paymentIntentObject ? paymentIntentObject.id : "";

  const existingDocs = await getDocs(
    query(
      collection(db, "payment_intent_orders"),
      where("paymentIntentId", "==", paymentIntentId),
      limit(1)
    )
  );

  return existingDocs.docs[0];
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

      if (paymentIntentOrderDoc) {
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

      if (paymentIntentOrderDoc) {
        const paymentIntentOrder =
          paymentIntentOrderDoc.data() as PaymentIntentOrder;
        const order = paymentIntentOrder.order;

        order.charges_id = paymentIntentOrder.paymentIntentId;

        // Move the order to the `orders` collection
        await addDoc(collection(db, "orders"), order);

        // Delete the payment intent order
        await deleteDoc(
          doc(db, "payment_intent_orders", paymentIntentOrderDoc.id)
        );
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
