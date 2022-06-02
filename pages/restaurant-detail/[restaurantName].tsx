import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { collection, getDocs, query, limit, where } from "firebase/firestore";
import { useRef } from "react";
import classNames from "classnames";
import { Plus, Clock, MapPin, Phone, Browser } from "phosphor-react";
import { usePosition } from "hooks/usePosition";
import haversine from "haversine-distance";

import { Head } from "components/Head";
import { Header } from "components/Header";
import { Toolbar } from "components/Toolbar";
import type { Coordinates, Restaurant, MenuItem, ApiMenuItem } from "types";
import { db } from "lib/server/db";
import { toApiMenuItem } from "lib/server/toApiMenuItem";
import { restaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";
import { urlParamToRestaurantName } from "lib/urlParamToRestaurantName";
import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";

interface RestaurantDetailPageProps {
  restaurant: Restaurant;
  menu?: ApiMenuItem[];
  menuItemsByCategory?: Record<string, ApiMenuItem[]>;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const restaurantDocs = await getDocs(
    collection(db, "Restaurants Philadelphia")
  );

  const paths = restaurantDocs.docs.map((doc) => {
    const restaurant = doc.data() as Restaurant;

    return {
      params: {
        restaurantName: restaurantNameToUrlParam(restaurant.Restaurant),
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<
  RestaurantDetailPageProps
> = async ({ params }) => {
  const restaurantName =
    typeof params?.restaurantName === "string"
      ? urlParamToRestaurantName(params.restaurantName)
      : null;
  const restaurantsRef = collection(db, "Restaurants Philadelphia");
  const restaurantQuery = query(
    restaurantsRef,
    where("Restaurant", "==", restaurantName),
    limit(1)
  );

  const restaurantDocs = await getDocs(restaurantQuery);

  const restaurantDoc = restaurantDocs.docs[0];

  if (!restaurantDoc) {
    return {
      notFound: true,
    };
  }

  const restaurantMenuRef = collection(restaurantDoc.ref, "Restaurant_Menu");
  const restaurantMenuDocs = await getDocs(restaurantMenuRef);

  const menuItemsByCategory: Record<string, ApiMenuItem[]> = {};

  const menu = restaurantMenuDocs.docs.map((doc) => {
    const menuItem = toApiMenuItem(doc.id, doc.data() as MenuItem);
    const category = menuItem.category;

    if (category) {
      if (!menuItemsByCategory[category]) {
        menuItemsByCategory[category] = [];
      }

      menuItemsByCategory[category].push(menuItem);
    }

    return menuItem;
  });

  return {
    props: {
      restaurant: restaurantDoc.data() as Restaurant,
      menu,
      menuItemsByCategory,
    },
    // Regenerate the page every 30 minutes (30 * 60 seconds)
    revalidate: 30 * 60,
  };
};

const RestaurantDetail: NextPage<RestaurantDetailPageProps> = ({
  restaurant,
  menu,
  menuItemsByCategory,
}) => {
  const scrollAreaTopRef = useRef<HTMLDivElement | null>(null);
  const { latitude, longitude, error: locationError } = usePosition(false);

  const userPosition: Coordinates | undefined =
    latitude && longitude ? { latitude, longitude } : undefined;

  const distance: number | null =
    userPosition && restaurant.Latitude && restaurant.Longitude
      ? Math.floor(
          (haversine(userPosition, {
            latitude: parseFloat(restaurant.Latitude),
            longitude: parseFloat(restaurant.Longitude),
          }) /
            1609.344) *
            100
        ) / 100
      : null;

  const isAddressVisible = !!restaurant.Address;
  const isDistanceVisible = typeof distance === "number" && !isNaN(distance);
  const isPhoneVisible = !!restaurant.Phone;
  const isWebsiteVisible = !!restaurant.Website;

  const { label: openingHoursLabel } = getOpeningHoursInfo(restaurant);

  return (
    <>
      <Head
        titles={[restaurant.Restaurant]}
        description={"Vegan dining and delivery"}
        ogMetadata={{
          title: restaurant.Restaurant,
          image: restaurant.Image ?? "",
          type: "website",
          url: `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/restaurant-detail/${encodeURIComponent(
            restaurantNameToUrlParam(restaurant.Restaurant)
          )}`,
        }}
      ></Head>
      <main className="flex flex-col mb-6">
        <Header />
        <section className="flex flex-col gap-0 container mx-auto">
          <Toolbar scrollAreaTopRef={scrollAreaTopRef}>
            <h2 className="text-3xl sm:text-4xl font-bold">
              {restaurant.Restaurant}
            </h2>
          </Toolbar>
          <div ref={scrollAreaTopRef}></div>
          <div className="flex flex-col gap-6 px-6">
            {restaurant.Image && (
              <div className="w-full h-44 sm:h-80 rounded-lg overflow-hidden flex-none flex">
                <Image
                  className="w-full object-cover"
                  layout="raw"
                  height={640}
                  width={960}
                  src={restaurant.Image}
                  alt=""
                />
              </div>
            )}
            <section className="flex flex-col gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold pb-2 border-b border-slate-100">
                Info
              </h3>
              <div className="flex flex-col gap-1 sm:gap-2">
                {openingHoursLabel ? (
                  <div className="flex gap-2 items-start">
                    <Clock
                      className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
                      size={20}
                      color={"#000000"}
                    />
                    <p className="text-sm sm:text-base flex items-center gap-2">
                      {openingHoursLabel}
                    </p>
                  </div>
                ) : null}
                {isAddressVisible || isDistanceVisible ? (
                  <div className="flex gap-2 items-center">
                    <MapPin
                      className="flex-none w-[16px] sm:w-[20px]"
                      size={20}
                      color={"#000000"}
                    />
                    <p className="text-sm sm:text-base flex items-center gap-2">
                      {isDistanceVisible ? `${distance} mi` : null}
                      {isDistanceVisible && isAddressVisible ? " ∙ " : null}
                      {isAddressVisible ? restaurant.Address : null}
                    </p>
                  </div>
                ) : null}
                {isPhoneVisible ? (
                  <div className="flex gap-2 items-center">
                    <Phone
                      className="flex-none w-[16px] sm:w-[20px]"
                      size={20}
                      color={"#000000"}
                    />
                    <p className="text-sm sm:text-base line-clamp-2">
                      {restaurant.Phone}
                    </p>
                  </div>
                ) : null}
                {isWebsiteVisible ? (
                  <div className="flex gap-2 items-center">
                    <Browser
                      className="flex-none w-[16px] sm:w-[20px]"
                      size={20}
                      color={"#000000"}
                    />
                    <p className="text-sm sm:text-base line-clamp-2">
                      {restaurant.Website}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold pb-2 border-b border-slate-100">
                Menu
              </h3>
              {menuItemsByCategory && (
                <ul className="flex flex-col gap-6">
                  {Object.keys(menuItemsByCategory).map((category) => {
                    return (
                      <li className="flex flex-col gap-2" key={category}>
                        <h4 className="text-xl sm:text-2xl capitalize font-bold">
                          {category}
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                          {menuItemsByCategory[category].map(
                            (menuItem, index) => {
                              return (
                                <li
                                  className={classNames({
                                    "flex gap-2 items-stretch flex-none border border-solid border-slate-100 rounded-lg overflow-hidden pr-3 shadow justify-between":
                                      true,
                                    "p-3": !menuItem.picture,
                                  })}
                                  key={index}
                                >
                                  <div className="flex gap-3 items-stretch">
                                    {menuItem.picture ? (
                                      <div className="flex flex-row gap-2 overflow-hidden h-32 w-32 flex-none">
                                        <Image
                                          alt=""
                                          height={128}
                                          layout="raw"
                                          src={menuItem.picture}
                                          width={128}
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : null}
                                    <div className="flex flex-col justify-center gap-1">
                                      {menuItem.name ? (
                                        <span className="text-base sm:text-lg line-clamp-2 sm:leading-6">
                                          {menuItem.name}
                                        </span>
                                      ) : null}
                                      {menuItem.mealDescription ? (
                                        <span className="text-sm sm:text-base line-clamp-2 sm:leading-5">
                                          {menuItem.mealDescription}
                                        </span>
                                      ) : null}
                                      <span className="text-sm">
                                        ${menuItem.mealPrice.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <button className="justify-self-end">
                                    <Plus
                                      className="flex-none w-[20px]"
                                      size={20}
                                      color={"#000000"}
                                    />
                                  </button>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            <section>
              <h3 className="text-2xl sm:text-3xl font-bold">Reviews</h3>
            </section>
          </div>
        </section>
      </main>
    </>
  );
};
export default RestaurantDetail;
