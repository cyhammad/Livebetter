import classNames from "classnames";
import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import {
  CrosshairSimple,
  MagnifyingGlass,
  Sliders,
  Spinner,
  X,
} from "phosphor-react";
import {
  ChangeEvent,
  useDeferredValue,
  useRef,
  useState,
  useTransition,
} from "react";
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
import { useHomeContext } from "hooks/useHomeContext";
import { usePosition } from "hooks/usePosition";
import type { Coordinates, FetchApiRestaurantsQueryKey } from "types";

interface HomeProps {
  dehydratedState: DehydratedState;
}

const PAGE_SIZE = 20;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const queryClient = new QueryClient();
  const limit = PAGE_SIZE;
  const offset = 0;

  const queryKey: FetchApiRestaurantsQueryKey = [
    "restaurants",
    limit,
    offset,
    null,
    "",
    [],
  ];

  await queryClient.prefetchQuery(queryKey, async () => {
    return await getApiRestaurants({ limit, offset });
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
  const {
    limit,
    offset,
    searchTerm,
    selectedCuisines,
    setLimit,
    setOffset,
    setSearchTerm,
    setSelectedCuisines,
    setShouldQueryLocation,
    shouldQueryLocation,
  } = useHomeContext();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
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
    deferredSearchTerm,
    selectedCuisines,
  ];

  const { isLoading, error, data } = useQuery(
    queryKey,
    () =>
      fetchRestaurants({
        limit,
        offset,
        search: deferredSearchTerm,
        sortByDistanceFrom: userPosition ?? undefined,
        cuisines: selectedCuisines,
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

  const handleCuisineChange = (event: ChangeEvent<HTMLInputElement>) => {
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
            <div
              className="grid grid-cols-3 grid-rows-2 md:grid-rows-1 gap-x-3"
              style={{ gridTemplateColumns: "auto 1fr 1fr" }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold">Restaurants</h2>
              <div className="grid row-start-2 md:row-start-1 md:col-start-2 col-span-3 md:col-span-1 items-center">
                <input
                  type="search"
                  className="
                    w-full
                    text-sm md:text-base
                    mt-0 px-0.5 mx-0.5 pl-6
                    border-0 border-b border-slate-400
                    focus:ring-0 focus:border-black
                    text-slate-400 focus:text-black
                    placeholder:text-slate-400 focus:placeholder:text-black
                    peer
                  "
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                  placeholder="Search..."
                  style={{ gridArea: "1 / 1" }}
                />
                <MagnifyingGlass
                  color="currentColor"
                  className="h-5 w-5 text-slate-400 peer-focus:text-black"
                  size={20}
                  style={{ gridArea: "1 / 1" }}
                  weight="bold"
                />
              </div>
              <div className="flex gap-2 items-center ml-auto col-start-3">
                <Spinner
                  size={32}
                  color={"currentColor"}
                  weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                  className={classNames({
                    "animate-spin": isLoading,
                    hidden: !isLoading,
                    "text-black": true,
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
                    color={"currentColor"}
                    weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                    style={{ gridArea: "1 / 1" }}
                    className={classNames({
                      "animation-spin":
                        shouldQueryLocation && !latitude && !longitude,
                      "text-black": !shouldQueryLocation,
                      "text-white": shouldQueryLocation,
                    })}
                  />
                  {locationError ? (
                    <X
                      size={12}
                      color={"currentColor"}
                      weight={"bold"}
                      style={{ gridArea: "1 / 1" }}
                      className={classNames({
                        "text-black": shouldQueryLocation && locationError,
                        "text-white": !(shouldQueryLocation && locationError),
                      })}
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
                    color={"currentColor"}
                    weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                    className={classNames({
                      "text-black": !isSettingsVisible,
                      "text-white": isSettingsVisible,
                    })}
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
                {data?.cuisines.map((cuisineLabel) => {
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
            onUserIsApproachingBottomOfList={() => {
              const nextOffset = data?.restaurants.length ?? 0;
              const nextLimit = nextOffset + PAGE_SIZE;

              // setOffset(nextOffset);
              setLimit(nextLimit);
            }}
            restaurants={data?.restaurants ?? []}
          />
        </section>
      </main>
    </>
  );
};

export default Home;
