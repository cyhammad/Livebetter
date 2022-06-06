import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { collection, getDocs, query, limit, where } from "firebase/firestore";
import { useRef } from "react";
import classNames from "classnames";
import { Clock, MapPin, Phone, Browser } from "phosphor-react";
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
  menu: {
    category: string;
    menuItems: ApiMenuItem[];
  }[];
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

  restaurantMenuDocs.docs
    .map((doc) => {
      const menuItem = toApiMenuItem(doc.id, doc.data() as MenuItem);

      return menuItem;
    })
    .sort((a, b) => {
      const aCategory = a.category?.toLowerCase() ?? "";
      const bCategory = b.category?.toLowerCase() ?? "";
      const isANonVegan = aCategory.includes("non vegan");
      const isBNonVegan = bCategory.includes("non vegan");

      if (isANonVegan && !isBNonVegan) {
        return 1;
      }

      if (!isANonVegan && isBNonVegan) {
        return -1;
      }

      return aCategory < bCategory ? -1 : aCategory > bCategory ? 1 : 0;
    })
    .forEach((menuItem) => {
      const category = menuItem.category;

      if (category) {
        if (!menuItemsByCategory[category]) {
          menuItemsByCategory[category] = [];
        }

        menuItemsByCategory[category].push(menuItem);
      }
    });

  const menu = Object.keys(menuItemsByCategory).map((key) => {
    return {
      category: key,
      menuItems: menuItemsByCategory[key].sort((a, b) => {
        if (a.picture && !b.picture) {
          return -1;
        }

        if (!a.picture && b.picture) {
          return 1;
        }

        const aTextLength = a.name.length + (a.mealDescription?.length ?? 0);
        const bTextLength = b.name.length + (b.mealDescription?.length ?? 0);

        return bTextLength - aTextLength;
      }),
    };
  });

  return {
    props: {
      restaurant: restaurantDoc.data() as Restaurant,
      menu,
    },
    // Regenerate the page every 30 minutes (30 * 60 seconds)
    revalidate: 30 * 60,
  };
};

const RestaurantDetail: NextPage<RestaurantDetailPageProps> = ({
  restaurant,
  menu,
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
            <div className="flex flex-col gap-1 sm:gap-2 md:flex-row justify-between">
              <h2 className="text-2xl sm:text-4xl font-bold">
                {restaurant.Restaurant}
              </h2>
              <select
                className={classNames({
                  "text-base bg-slate-50 rounded my-1": true,
                  "border-0 ": true,
                  "focus:ring-0 focus:border-black": true,
                })}
              >
                {menu.map(({ category }) => (
                  <option key="category" value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </Toolbar>
          <div ref={scrollAreaTopRef}></div>
          <div className="flex flex-col gap-6 px-4 sm:px-6">
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
                    <a
                      href={restaurant.Website}
                      className="text-sm sm:text-base line-clamp-2 underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {restaurant.Website}
                    </a>
                  </div>
                ) : null}
              </div>
            </section>
            <section className="flex flex-col gap-2">
              {menu && (
                <ul className="flex flex-col gap-7">
                  {menu.map(({ category, menuItems }) => {
                    let distribution = 0;

                    return (
                      <li className="flex flex-col gap-3" key={category}>
                        <h4 className="text-xl sm:text-2xl uppercase font-bold">
                          {category}
                        </h4>
                        <ul className="grid grid-cols-12 gap-4 gap-x-6">
                          {menuItems.map((menuItem, index) => {
                            const hasPicture = !!menuItem.picture;
                            const hasLongDescription =
                              menuItem.mealDescription &&
                              menuItem.mealDescription?.length >= 150;
                            const hasPictureAndLongDescription =
                              hasPicture && hasLongDescription;

                            distribution += hasPictureAndLongDescription
                              ? 1
                              : 0.5;

                            const isLastHalfItem =
                              index === menuItems.length - 1 &&
                              distribution - Math.floor(distribution) === 0.5;

                            return (
                              <li
                                className={classNames({
                                  "flex gap-3 flex-none col-span-12 sm:col-span-6":
                                    true,
                                  "sm:col-span-12":
                                    hasPicture || isLastHalfItem,

                                  "lg:col-span-6":
                                    !hasPictureAndLongDescription &&
                                    !isLastHalfItem,
                                })}
                                key={index}
                              >
                                {menuItem.picture ? (
                                  <div
                                    className={classNames({
                                      "flex flex-row gap-2 overflow-hidden flex-none h-28 w-28 sm:h-48 sm:w-48 xl:h-56 xl:w-56":
                                        true,
                                    })}
                                  >
                                    <Image
                                      alt=""
                                      height={224}
                                      layout="raw"
                                      src={menuItem.picture}
                                      width={224}
                                      className="object-cover rounded-lg"
                                    />
                                  </div>
                                ) : null}
                                <div
                                  className={classNames({
                                    "flex flex-col justify-start gap-1": true,
                                    "justify-center": hasPicture,
                                  })}
                                >
                                  {menuItem.name ? (
                                    <span className="text-base sm:text-lg font-bold line-clamp-2 sm:leading-6">
                                      {menuItem.name}
                                    </span>
                                  ) : null}
                                  {menuItem.mealDescription ? (
                                    <span className="text-sm sm:text-base line-clamp-2 sm:line-clamp-4 sm:leading-6">
                                      {menuItem.mealDescription}
                                    </span>
                                  ) : null}
                                  <span className="text-sm">
                                    ${menuItem.mealPrice.toFixed(2)}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
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
