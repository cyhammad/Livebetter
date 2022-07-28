import {
  DehydratedState,
  QueryClient,
  dehydrate,
  useQuery,
} from "@tanstack/react-query";
import classNames from "classnames";
import type { GetStaticProps, NextPage } from "next";
import { useRef } from "react";

import { Head } from "components/Head";
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
  const restaurantListTopRef = useRef<HTMLDivElement | null>(null);
  const { location } = useUserContext();
  const { latitude, longitude } = location || {};
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
        <div ref={restaurantListTopRef}></div>
        <div className="flex flex-col col-span-2 h-full w-full gap-8">
          {getSectionKeys().map((sectionKey) => {
            const restaurants = data?.sections[sectionKey];

            if (!restaurants) {
              return null;
            }

            return (
              <section className="flex flex-col gap-2" key={sectionKey}>
                <h3 className="text-xl sm:text-2xl font-bold container mx-auto ">
                  <div className="px-4 sm:px-6">
                    {sectionKeyToHeadingMap[sectionKey]}
                  </div>
                </h3>
                <ul
                  className="flex overflow-auto gap-4 sm:gap-8 pl-4 sm:pl-0
                  snap-x snap-mandatory scroll-ml-4 scroll-pl-4
                  sm:scroll-pl-[calc(((100vw-640px)/2)+1rem)]
                  sm:scroll-ml-[calc(((100vw-640px)/2)+1rem)]
                  md:scroll-pl-[calc(((100vw-768px)/2)+1rem)]
                  md:scroll-ml-[calc(((100vw-768px)/2)+1rem)]
                  lg:scroll-pl-[calc(((100vw-1024px)/2)+1rem)]
                  lg:scroll-ml-[calc(((100vw-1024px)/2)+1rem)]
                  xl:scroll-pl-[calc(((100vw-1280px)/2)+1rem)]
                  xl:scroll-ml-[calc(((100vw-1280px)/2)+1rem)]
                  2xl:scroll-pl-[calc(((100vw-1536px)/2)+1rem)]
                  2xl:scroll-ml-[calc(((100vw-1536px)/2)+1rem)]
                  no-scrollbars
                "
                >
                  {restaurants.map((restaurant, index) => (
                    <li
                      className={classNames(
                        "flex flex-col flex-none gap-5 snap-start",
                        index === 0
                          ? [
                              "sm:pl-[calc(((100vw-640px)/2)+1rem)]",
                              "md:pl-[calc(((100vw-768px)/2)+1rem)]",
                              "lg:pl-[calc(((100vw-1024px)/2)+1rem)]",
                              "xl:pl-[calc(((100vw-1280px)/2)+1rem)]",
                              "2xl:pl-[calc(((100vw-1536px)/2)+1rem)]",
                            ]
                          : index === restaurants.length - 1
                          ? [
                              "pr-4",
                              "sm:pr-[calc(((100vw-640px)/2)+1rem)]",
                              "md:pr-[calc(((100vw-768px)/2)+1rem)]",
                              "lg:pr-[calc(((100vw-1024px)/2)+1rem)]",
                              "xl:pr-[calc(((100vw-1280px)/2)+1rem)]",
                              "2xl:pr-[calc(((100vw-1536px)/2)+1rem)]",
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
