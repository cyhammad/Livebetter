import classNames from "classnames";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRef } from "react";
import { DehydratedState, QueryClient, dehydrate, useQuery } from "react-query";

import { Header } from "components/Header";
import { HomeHero } from "components/HomeHero";
import { RestaurantCard } from "components/RestaurantCard";
import { Toolbar } from "components/Toolbar";
import { useUserContext } from "hooks/useUserContext";
import { fetchFeaturedRestaurants } from "lib/client/fetchFeaturedRestaurants";
import { getSectionKeys } from "lib/getSectionKeys";
import { getFeaturedApiRestaurants } from "lib/server/getFeaturedApiRestaurants";
import type {
  Coordinates,
  FeaturedSection,
  FetchFeaturedApiRestaurantsQueryKey,
} from "types";

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

const sectionKeyToHeadingMap: Record<FeaturedSection, string> = {
  breakfast: "Breakfast",
  brunch: "Brunch",
  city_favorites: "City Favorites",
  dinner: "Dinner",
  late_night: "Late Night",
  lunch: "Lunch",
  staff_picks: "Staff Picks",
  tracking: "Get Food Delivered",
};

const Home: NextPage<HomeProps> = () => {
  const { location } = useUserContext();
  const restaurantListTopRef = useRef<HTMLDivElement | null>(null);
  const {
    latitude,
    longitude,
    // error: locationError,
  } = location || {};
  const userPosition: Coordinates | null =
    latitude && longitude ? { latitude, longitude } : null;

  const queryKey: FetchFeaturedApiRestaurantsQueryKey = [
    "featured_restaurants",
    getSectionKeys(),
    userPosition,
  ];

  const { data } = useQuery(
    queryKey,
    () =>
      fetchFeaturedRestaurants({
        sectionKeys: getSectionKeys(),
        sortByDistanceFrom: userPosition ?? undefined,
      }),
    {
      keepPreviousData: true,
    }
  );

  return (
    <>
      <Head>
        <title>Live Better</title>
        <meta name="description" content="Vegan dining and delivery" />
      </Head>
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
        <div ref={restaurantListTopRef}></div>
        <div className="flex flex-col col-span-2 gap-8 h-full w-full">
          {getSectionKeys().map((sectionKey) => {
            const restaurants = data?.sections[sectionKey];

            if (!restaurants) {
              return null;
            }

            return (
              <section className="flex flex-col gap-2" key={sectionKey}>
                <h3 className="text-xl sm:text-2xl font-bold container mx-auto ">
                  <div className="px-4 sm:px-6">
                    {sectionKeyToHeadingMap[sectionKey as FeaturedSection]}
                  </div>
                </h3>
                <ul
                  className="flex overflow-auto gap-4 sm:gap-8 pl-4 sm:pl-0
                  snap-x snap-mandatory scroll-ml-4 scroll-pl-4
                  sm:scroll-pl-[calc(((100vw-640px)/2)+1.5rem)]
                  sm:scroll-ml-[calc(((100vw-640px)/2)+1.5rem)]
                  md:scroll-pl-[calc(((100vw-768px)/2)+1.5rem)]
                  md:scroll-ml-[calc(((100vw-768px)/2)+1.5rem)]
                  lg:scroll-pl-[calc(((100vw-1024px)/2)+1.5rem)]
                  lg:scroll-ml-[calc(((100vw-1024px)/2)+1.5rem)]
                  xl:scroll-pl-[calc(((100vw-1280px)/2)+1.5rem)]
                  xl:scroll-ml-[calc(((100vw-1280px)/2)+1.5rem)]
                  2xl:scroll-pl-[calc(((100vw-1536px)/2)+1.5rem)]
                  2xl:scroll-ml-[calc(((100vw-1536px)/2)+1.5rem)]
                "
                >
                  {restaurants.map((restaurant, index) => (
                    <li
                      className={classNames(
                        "flex flex-col flex-none gap-5 snap-start",
                        index === 0
                          ? [
                              "sm:pl-[calc(((100vw-640px)/2)+1.5rem)]",
                              "md:pl-[calc(((100vw-768px)/2)+1.5rem)]",
                              "lg:pl-[calc(((100vw-1024px)/2)+1.5rem)]",
                              "xl:pl-[calc(((100vw-1280px)/2)+1.5rem)]",
                              "2xl:pl-[calc(((100vw-1536px)/2)+1.5rem)]",
                            ]
                          : index === restaurants.length - 1
                          ? [
                              "pr-4",
                              "sm:pr-[calc(((100vw-640px)/2)+1.5rem)]",
                              "md:pr-[calc(((100vw-768px)/2)+1.5rem)]",
                              "lg:pr-[calc(((100vw-1024px)/2)+1.5rem)]",
                              "xl:pr-[calc(((100vw-1280px)/2)+1.5rem)]",
                              "2xl:pr-[calc(((100vw-1536px)/2)+1.5rem)]",
                            ]
                          : []
                      )}
                      key={`${restaurant.Restaurant}${index}`}
                    >
                      <RestaurantCard
                        layout="vertical"
                        restaurant={restaurant}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default Home;
