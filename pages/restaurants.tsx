import {
  DehydratedState,
  QueryClient,
  dehydrate,
  useQuery,
} from "@tanstack/react-query";
import classNames from "classnames";
import type { GetStaticProps, NextPage } from "next";
import { MagnifyingGlass, Sliders, Spinner } from "phosphor-react";
import {
  ChangeEvent,
  useDeferredValue,
  useRef,
  useState,
  useTransition,
} from "react";

import { Footer } from "components/Footer";
import { Head } from "components/Head";
import { Header } from "components/Header";
import { RestaurantList } from "components/RestaurantList";
import { Toolbar } from "components/Toolbar";
import { useHomeContext } from "hooks/useHomeContext";
import { useUserContext } from "hooks/useUserContext";
import { fetchRestaurants } from "lib/client/fetchRestaurants";
import { getApiRestaurants } from "lib/server/getApiRestaurants";
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
    setSearchTerm,
    setSelectedCuisines,
  } = useHomeContext();
  const { location } = useUserContext();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [, startTransition] = useTransition();
  const restaurantListTopRef = useRef<HTMLDivElement | null>(null);
  const { latitude, longitude } = location || {};
  const userPosition: Coordinates | null =
    latitude && longitude ? { latitude, longitude } : null;

  const queryKey: FetchApiRestaurantsQueryKey = [
    "restaurants",
    limit,
    offset,
    userPosition,
    deferredSearchTerm,
    selectedCuisines,
  ];

  const { isLoading, data } = useQuery(
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

  return (
    <>
      <Head
        titles={["Restaurants"]}
        description={`Search and filter through all vegan restaurants in Philly.`}
        ogMetadata={{
          description: `Search and filter through all vegan restaurants in Philly.`,
          title: "Restaurants - Live Better PHL",
          image: "https://www.livebetterphl.com/logo.png",
          type: "website",
          url: "https://www.livebetterphl.com/restaurants",
        }}
      ></Head>
      <main className="flex flex-col">
        <Header />
        <section className="flex flex-col gap-0 container mx-auto">
          <Toolbar
            isShadowVisible={isSettingsVisible}
            scrollAreaTopRef={restaurantListTopRef}
          >
            <div
              className={classNames({
                "grid grid-cols-3 sm:grid-rows-1 gap-x-4": true,
                "grid-rows-1": !isSettingsVisible,
                "grid-rows-2": isSettingsVisible,
              })}
              style={{ gridTemplateColumns: "auto 1fr 1fr" }}
            >
              <h2 className="text-2xl sm:text-4xl font-bold">Restaurants</h2>
              <div
                className={classNames({
                  "sm:grid row-start-2 sm:row-start-1 sm:col-start-2 col-span-3 sm:col-span-1 items-center":
                    true,
                  grid: isSettingsVisible,
                  hidden: !isSettingsVisible,
                })}
              >
                <input
                  type="search"
                  className={classNames({
                    "w-full": true,
                    "text-sm sm:text-base": true,
                    "mt-0 px-0.5 mx-0.5 pl-6": true,
                    "border-0 border-b border-slate-400": true,
                    "focus:ring-0 focus:border-black": true,
                    "text-black": true,
                    "placeholder:text-slate-300": true,
                    peer: true,
                  })}
                  style={{ gridArea: "1 / 1" }}
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                  placeholder="Search..."
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
                  color="currentColor"
                  weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                  className={classNames({
                    "animate-spin": isLoading,
                    hidden: !isLoading,
                    "text-black h-7 w-7 sm:h-8 sm:w-8": true,
                  })}
                />
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
                    color="currentColor"
                    weight={selectedCuisines.length > 0 ? "fill" : "regular"}
                    className={classNames({
                      "text-black": !isSettingsVisible,
                      "text-white": isSettingsVisible,
                      "h-7 w-7 sm:h-8 sm:w-8": true,
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

              setLimit(nextLimit);
            }}
            restaurants={data?.restaurants ?? []}
          />
        </section>
        <Footer className="mt-6" />
      </main>
    </>
  );
};

export default Home;
