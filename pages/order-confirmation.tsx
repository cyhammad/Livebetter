import { Elements } from "@stripe/react-stripe-js";
import type { NextPage } from "next";
import Head from "next/head";
import { useRef } from "react";

import { Header } from "components/Header";
import { OrderConfirmationDetails } from "components/OrderConfirmationDetails";
import { Toolbar } from "components/Toolbar";
import { getStripePromise } from "lib/getStripePromise";

const OrderConfirmation: NextPage = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaTopRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Head>
        <title>Live Better</title>
        <meta name="description" content="Vegan dining and delivery" />
      </Head>
      <main className="flex flex-col mb-6">
        <Header ref={headerRef} />
        <Elements stripe={getStripePromise()}>
          <section className="flex flex-col gap-0 container mx-auto">
            <Toolbar ref={toolbarRef} scrollAreaTopRef={scrollAreaTopRef}>
              <div className="flex flex-col gap-1 sm:gap-4 md:flex-row justify-between md:items-center">
                <h2 className="text-2xl sm:text-4xl font-bold">
                  Thank you for your order
                </h2>
              </div>
            </Toolbar>
            <div ref={scrollAreaTopRef}></div>
            <OrderConfirmationDetails />
          </section>
        </Elements>
      </main>
    </>
  );
};

export default OrderConfirmation;
