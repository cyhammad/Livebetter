import {
  DehydratedState,
  QueryClient,
  dehydrate,
  useQuery,
} from "@tanstack/react-query";
import classNames from "classnames";
import type { GetStaticProps, NextPage } from "next";
import { useEffect, useRef, useState } from "react";

import { Head } from "components/Head";
import { Header } from "components/Header";
import { HomeHero } from "components/HomeHero";
import { RestaurantSections } from "components/RestaurantSections";
import { Toolbar } from "components/Toolbar";
import { useUserContext } from "hooks/useUserContext";
import { fetchFeaturedRestaurants } from "lib/client/fetchFeaturedRestaurants";
import { getSectionKeys } from "lib/getSectionKeys";
import { getFeaturedApiRestaurants } from "lib/server/getFeaturedApiRestaurants";
import type { Coordinates, FetchFeaturedApiRestaurantsQueryKey } from "types";

interface HomeProps {
  dehydratedState: DehydratedState;
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const queryClient = new QueryClient();

  const queryKey: FetchFeaturedApiRestaurantsQueryKey = [
    "featured_restaurants",
    getSectionKeys(),
    null,
  ];

  await queryClient.prefetchQuery(queryKey, async () => {
    return await getFeaturedApiRestaurants({
      sectionKeys: getSectionKeys(),
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

const Home: NextPage<HomeProps> = () => {
  const restaurantListTopRef = useRef<HTMLDivElement | null>(null);
  const { location } = useUserContext();
  const { latitude, longitude } = location || {};

  const [queryKey, setQueryKey] = useState<FetchFeaturedApiRestaurantsQueryKey>(
    ["featured_restaurants", getSectionKeys(), null]
  );

  const { data } = useQuery(
    queryKey,
    () => {
      const userPosition: Coordinates | null =
        latitude && longitude ? { latitude, longitude } : null;

      return fetchFeaturedRestaurants({
        sectionKeys: getSectionKeys(),
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

    setQueryKey(["featured_restaurants", getSectionKeys(), userPosition]);
  }, [latitude, longitude]);

  return (
    <>
      <Head
        titles={[]}
        description={`Find and order vegan food near you.`}
        ogMetadata={{
          description: `Find and order vegan food near you.`,
          title: "Live Better PHL",
          image: "https://www.livebetterphl.com/logo.png",
          type: "website",
          url: "https://www.livebetterphl.com/",
        }}
      ></Head>
      <main className="flex flex-col mb-6">
        <Header />
        <HomeHero />
        <Toolbar scrollAreaTopRef={restaurantListTopRef}>
          <div
            className={classNames({
              "grid grid-cols-3 grid-rows-1 gap-x-4": true,
            })}
            style={{ gridTemplateColumns: "auto 1fr 1fr" }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold">
              Browse Restaurants
            </h2>
          </div>
        </Toolbar>
        <div ref={restaurantListTopRef} />
        {data?.sections ? (
          <RestaurantSections
            sectionKeys={getSectionKeys()}
            sections={data.sections}
          />
        ) : null}
      </main>
    </>
  );
};

export default Home;
