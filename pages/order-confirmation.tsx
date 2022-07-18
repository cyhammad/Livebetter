import { Elements } from "@stripe/react-stripe-js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRef } from "react";

import { Header } from "components/Header";
import { OrderConfirmationDetails } from "components/OrderConfirmationDetails";
import { Toolbar } from "components/Toolbar";
import { getStripePromise } from "lib/getStripePromise";
import { db } from "lib/server/db";
import { ApiOrder, Order, PaymentIntentOrder, ShippingMethod } from "types";

interface OrderConfirmationProps {
  order: ApiOrder | null;
}

export const getServerSideProps: GetServerSideProps<
  OrderConfirmationProps
> = async ({ query: urlQuery }) => {
  const paymentIntentId =
    typeof urlQuery.payment_intent !== "undefined"
      ? urlQuery.payment_intent
      : null;

  if (typeof paymentIntentId !== "string") {
    return {
      notFound: true,
    };
  }

  const paymentIntentOrderDoc = await getDoc(
    doc(db, "payment_intent_orders", paymentIntentId)
  );

  const paymentIntentOrder = paymentIntentOrderDoc.exists()
    ? (paymentIntentOrderDoc.data() as PaymentIntentOrder)
    : null;

  const orderDoc = await getDocs(
    query(
      collection(db, "orders"),
      where("charges_id", "==", paymentIntentId),
      limit(1)
    )
  );

  const order =
    (orderDoc.docs[0]?.data() as Order) ?? paymentIntentOrder?.order ?? null;

  const apiOrder: ApiOrder = {
    ...order,

    // convert Timestamp to string
    created_at: order.created_at.toDate().toJSON(),
  };

  return {
    props: {
      order: apiOrder,
    },
  };
};

const OrderConfirmation: NextPage<OrderConfirmationProps> = ({ order }) => {
  const headerRef = useRef<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaTopRef = useRef<HTMLDivElement | null>(null);

  const shippingMethod: ShippingMethod =
    order?.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery";

  return (
    <>
      <Head>
        <title>Live Better</title>
        <meta name="description" content="Vegan dining and delivery" />
      </Head>
      <main className="flex flex-col mb-6">
        <Header ref={headerRef} />
        <Elements stripe={getStripePromise()}>
          <section className="flex flex-col gap-0 container mx-auto max-w-3xl">
            <Toolbar ref={toolbarRef} scrollAreaTopRef={scrollAreaTopRef}>
              <div className="flex flex-col gap-1 sm:gap-4 md:flex-row justify-between md:items-center">
                <h2 className="text-2xl sm:text-4xl font-bold">
                  <span className="capitalize">
                    {order?.restaurant_id.toLowerCase()}
                  </span>{" "}
                  {shippingMethod} order confirmation
                </h2>
              </div>
            </Toolbar>
            <div ref={scrollAreaTopRef}></div>
            <OrderConfirmationDetails order={order} />
          </section>
        </Elements>
      </main>
    </>
  );
};

export default OrderConfirmation;
