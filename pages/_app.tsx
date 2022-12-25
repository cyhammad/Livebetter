import "styles/globals.css";

import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";

import { CartContextProvider } from "hooks/useCartContext";
import { HomeContextProvider } from "hooks/useHomeContext";
import { InputPlacesAutocompleteContextProvider } from "hooks/useInputPlacesAutocompleteContext";
import { UserContextProvider } from "hooks/useUserContext";
import { reportPageView } from "lib/client/gtag";

// Every page must have 1 main element
try {
  ReactModal.setAppElement("main");
} catch (err) {
  // Do nothing
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      reportPageView(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    router.events.on("hashChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      router.events.off("hashChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  if (typeof window === "undefined") {
    return <></>;
  } else {
    return (
      <>
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <Script
          id="gtag-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
              />
              <meta
                name="description"
                content="Find and order vegan food in Philly."
              />
            </Head>
            <UserContextProvider>
              <CartContextProvider>
                <HomeContextProvider>
                  <InputPlacesAutocompleteContextProvider>
                    <Component {...pageProps} />
                  </InputPlacesAutocompleteContextProvider>
                </HomeContextProvider>
              </CartContextProvider>
            </UserContextProvider>
          </Hydrate>
        </QueryClientProvider>
      </>
    );
  }
}
