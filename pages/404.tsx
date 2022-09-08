import {
  DehydratedState,
  QueryClient,
  dehydrate,
  useQuery,
} from "@tanstack/react-query";
import type { GetStaticProps, NextPage } from "next";
import { useEffect, useRef, useState } from "react";

import { Footer } from "components/Footer";
import { Head } from "components/Head";
import { Header } from "components/Header";
import { RestaurantSections } from "components/RestaurantSections";
import { Toolbar } from "components/Toolbar";
import { useUserContext } from "hooks/useUserContext";
import { fetchFeaturedRestaurants } from "lib/client/fetchFeaturedRestaurants";
import { getFeaturedApiRestaurants } from "lib/server/getFeaturedApiRestaurants";
import type {
  Coordinates,
  FeaturedSection,
  FetchFeaturedApiRestaurantsQueryKey,
} from "types";

interface Error404Props {
  dehydratedState: DehydratedState;
}

const sectionKeys: FeaturedSection[] = ["staff_picks", "city_favorites"];

export const getStaticProps: GetStaticProps<Error404Props> = async () => {
  const queryClient = new QueryClient();

  const queryKey: FetchFeaturedApiRestaurantsQueryKey = [
    "featured_restaurants",
    sectionKeys,
    null,
  ];

  await queryClient.prefetchQuery(queryKey, async () => {
    return await getFeaturedApiRestaurants({
      sectionKeys,
    });
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    // Regenerate the page every 30 minutes (30 * 60 seconds)
    revalidate: 30 * 60,
  };
};

const Error404Page: NextPage = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaTopRef = useRef<HTMLDivElement | null>(null);

  const { location } = useUserContext();
  const { latitude, longitude } = location || {};

  const [queryKey, setQueryKey] = useState<FetchFeaturedApiRestaurantsQueryKey>(
    ["featured_restaurants", ["city_favorites", "staff_picks"], null]
  );

  const { data } = useQuery(
    queryKey,
    () => {
      const userPosition: Coordinates | null =
        latitude && longitude ? { latitude, longitude } : null;

      return fetchFeaturedRestaurants({
        sectionKeys,
        sortByDistanceFrom: userPosition ?? undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    const userPosition: Coordinates | null =
      latitude && longitude ? { latitude, longitude } : null;

    setQueryKey(["featured_restaurants", sectionKeys, userPosition]);
  }, [latitude, longitude]);

  return (
    <>
      <Head
        titles={["404", "Not found"]}
        description=""
        ogMetadata={{
          image: "https://www.livebetterphl.com/logo.png",
          title: "404 Not found - Live Better PHL",
          type: "website",
          url: "https://www.livebetterphl.com/404",
        }}
      />
      <main className="flex flex-col">
        <Header ref={headerRef} />
        <Toolbar ref={toolbarRef} scrollAreaTopRef={scrollAreaTopRef}>
          <div className="flex flex-col gap-1 sm:gap-4 md:flex-row justify-between md:items-center">
            <h2 className="text-2xl sm:text-4xl font-bold">
              Uh oh... we couldn&apos;t find that page
            </h2>
          </div>
        </Toolbar>
        <div ref={scrollAreaTopRef} />
        <div className="flex flex-col gap-4">
          <p className="text-lg container mx-auto px-4 sm:px-6">
            But here are some other restaurants you might be interested in:
          </p>
          {data?.sections ? (
            <RestaurantSections
              sectionKeys={sectionKeys}
              sections={data.sections}
            />
          ) : null}
        </div>
        <Footer className="mt-6" />
      </main>
    </>
  );
};

export default Error404Page;
