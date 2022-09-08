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
import { HomeHero } from "components/HomeHero";
import { RestaurantSections } from "components/RestaurantSections";
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
        description={`Find and order vegan food in Philly.`}
        ogMetadata={{
          description: `Find and order vegan food in Philly.`,
          title: "Live Better PHL",
          image: "https://www.livebetterphl.com/logo.png",
          type: "website",
          url: "https://www.livebetterphl.com/",
        }}
      ></Head>
      <main className="flex flex-col">
        <Header />
        <HomeHero />
        <div ref={restaurantListTopRef} />
        {data?.sections ? (
          <RestaurantSections
            className="mt-4 sm:mt-5"
            sectionKeys={getSectionKeys()}
            sections={data.sections}
          />
        ) : null}
        <Footer className="mt-6" />
      </main>
    </>
  );
};

export default Home;
