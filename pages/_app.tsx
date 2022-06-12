import "styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

import { HomeContextProvider } from "hooks/useHomeContext";
import { UserContextProvider } from "hooks/useUserContext";

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
          <HomeContextProvider>
            <Component {...pageProps} />
          </HomeContextProvider>
        </UserContextProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}
