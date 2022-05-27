import classNames from "classnames";
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { CrosshairSimple, Sliders, Spinner, X } from "phosphor-react";
import React, { useState, useTransition, useMemo, useRef } from "react";
import {
  dehydrate,
  QueryClient,
  useQuery,
  useInfiniteQuery,
  DehydratedState,
} from "react-query";

import { getApiRestaurants } from "lib/server/getApiRestaurants";
import { fetchRestaurants } from "lib/client/fetchRestaurants";
import { Header } from "components/Header";
import { RestaurantList } from "components/RestaurantList";
import { Toolbar } from "components/Toolbar";
import { usePosition } from "hooks/usePosition";
import type { Coordinates, FetchApiRestaurantsQueryKey } from "types";

interface HomeProps {
  dehydratedState: DehydratedState;
}

const PAGE_SIZE = 20;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const queryClient = new QueryClient();
  const limit = PAGE_SIZE;
  const offset = 0;

  const queryKey: FetchApiRestaurantsQueryKey = [
    "restaurants",
    limit,
    offset,
    null,
    "",
  ];

  await queryClient.prefetchQuery(queryKey, async () => {
      return await getApiRestaurants({ limit, offset });
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const Home: NextPage<HomeProps> = () => {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [shouldQueryLocation, setShouldQueryLocation] = useState(false);
  const [_isPending, startTransition] = useTransition();
  const restaurantListTopRef = useRef<HTMLDivElement | null>(null);
  const {
    latitude,
    longitude,
    error: locationError,
  } = usePosition(shouldQueryLocation);
  const userPosition: Coordinates | null =
    latitude && longitude && shouldQueryLocation
      ? { latitude, longitude }
      : null;

  const queryKey: FetchApiRestaurantsQueryKey = [
    "restaurants",
    limit,
    offset,
    userPosition,
    searchTerm,
  ];

  const { isLoading, error, data, isFetching } = useQuery(
    queryKey,
    () =>
      fetchRestaurants({
        limit,
        offset,
        search: searchTerm,
        sortByDistanceFrom: userPosition ?? undefined,
      }),
    {
      keepPreviousData: true,
    }
  );

  // const {
  //   data,
  //   error,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetching,
  //   isFetchingNextPage,
  //   status,
  // } = useInfiniteQuery(
  //   "projects",
  //   () =>
  //     fetchRestaurants({
  //       limit,
  //       offset,
  //       search: searchTerm,
  //       sortByDistanceFrom: userPosition,
  //     }),
  //   {
  //     getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  //   }
  // );

  const availableCuisines = useMemo(() => {
    const nextAvailableCuisines = new Set<string>();

    data?.restaurants.forEach((restaurant) => {
      // Default to true, so all are available when no cuisines are checked
      let hasAllSelectedCuisines = true;

      if (selectedCuisines.length > 0) {
        hasAllSelectedCuisines = selectedCuisines.every(
          (cuisineItem) => !!restaurant.cuisines?.includes(cuisineItem) ?? false
        );
      }

      if (restaurant.cuisines && hasAllSelectedCuisines) {
        restaurant.cuisines.forEach((cuisineItem) => {
          nextAvailableCuisines.add(cuisineItem);
        });
      }
    });

    return [...nextAvailableCuisines].sort((a, b) => (a < b ? -1 : 1));
  }, [data?.restaurants, selectedCuisines]);

  const handleCuisineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    if (checked) {
      startTransition(() => setSelectedCuisines([...selectedCuisines, value]));
    } else {
      startTransition(() =>
        setSelectedCuisines(
          selectedCuisines.filter((cuisine) => cuisine !== value)
        )
      );
    }
  };

  const handleLocationClick = () => {
    setShouldQueryLocation(!shouldQueryLocation);
  };

  return (
    <>
      <Head>
        <title>Live Better</title>
        <meta name="description" content="Vegan dining and delivery" />
      </Head>
      <main className="flex flex-col mb-6">
        <Header />
        <section className="flex flex-col gap-0 container mx-auto">
          <Toolbar
            isShadowVisible={isSettingsVisible}
            scrollAreaTopRef={restaurantListTopRef}
          >
            <div className="flex w-full justify-between items-center">
              <form className="flex gap-4 items-end">
                <h2 className="text-3xl sm:text-4xl font-bold">Restaurants</h2>
                {/* <input
                  type="search"
                  className="border-slate-200 rounded-full"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                /> */}
              </form>
              <div className="flex gap-2 items-center">
                <Spinner
                  size={32}
                  color={shouldQueryLocation ? "#FFFFFF" : "#000000"}
                  weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                  className={classNames({
                    "animate-spin": isFetching || isLoading,
                    hidden: !isFetching && !isLoading,
                  })}
                />
                <button
                  aria-pressed={shouldQueryLocation}
                  aria-label={
                    latitude && longitude
                      ? "Sorted by closest"
                      : "Sort by closest"
                  }
                  onClick={handleLocationClick}
                  className={classNames({
                    "p-1 rounded-md grid items-center justify-items-center":
                      true,
                    "bg-black": shouldQueryLocation,
                  })}
                >
                  <CrosshairSimple
                    size={32}
                    color={shouldQueryLocation ? "#FFFFFF" : "#000000"}
                    weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                    style={{ gridArea: "1 / 1" }}
                    className={classNames({
                      "animation-spin":
                        shouldQueryLocation && !latitude && !longitude,
                    })}
                  />
                  {locationError ? (
                    <X
                      size={12}
                      color={
                        shouldQueryLocation && locationError
                          ? "#000000"
                          : "#FFFFFF"
                      }
                      weight={"bold"}
                      style={{ gridArea: "1 / 1" }}
                    ></X>
                  ) : null}
                </button>
                <button
                  aria-pressed={isSettingsVisible}
                  aria-label={
                    isSettingsVisible ? "Hide settings" : "Show settings"
                  }
                  onClick={() => setIsSettingsVisible(!isSettingsVisible)}
                  className={classNames({
                    "p-1 rounded-md": true,
                    "bg-black": isSettingsVisible,
                  })}
                >
                  <Sliders
                    size={32}
                    color={isSettingsVisible ? "#FFFFFF" : "#000000"}
                    weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                  />
                </button>
              </div>
            </div>
            <div
              className={classNames({
                hidden: !isSettingsVisible,
                "max-h-64 overflow-auto border-t border-b border-solid border-slate-100":
                  true,
              })}
            >
              <form className="flex flex-col gap-2 capitalize py-2">
                {availableCuisines.map((cuisineLabel) => {
                  return (
                    <label
                      className="flex gap-2 items-center"
                      key={cuisineLabel}
                    >
                      <input
                        type="checkbox"
                        className="text-black"
                        onChange={handleCuisineChange}
                        value={cuisineLabel}
                        checked={selectedCuisines.includes(cuisineLabel)}
                      />
                      {cuisineLabel}
                    </label>
                  );
                })}
              </form>
            </div>
          </Toolbar>
          <div ref={restaurantListTopRef}></div>
          <RestaurantList
            onUserIsApproachingEndOfList={() => {
              const nextOffset = data?.restaurants.length ?? 0;
              const nextLimit = nextOffset + PAGE_SIZE;

              // setOffset(nextOffset);
              setLimit(nextLimit);
            }}
            restaurants={data?.restaurants ?? []}
            selectedCuisines={selectedCuisines}
          />
        </section>
      </main>
    </>
  );
};

export default Home;
