import "styles/globals.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import ReactModal from "react-modal";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

import { CartContextProvider } from "hooks/useCartContext";
import { HomeContextProvider } from "hooks/useHomeContext";
import { InputPlacesAutocompleteContextProvider } from "hooks/useInputPlacesAutocompleteContext";
import { UserContextProvider } from "hooks/useUserContext";

// Every page must have 1 main element
ReactModal.setAppElement("main");

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
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
  );
}
