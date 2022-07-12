import { collection, getDocs, limit, query, where } from "firebase/firestore";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/future/image";
import { Browser, MapPin } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { Element, Events, Link, scrollSpy, scroller } from "react-scroll";

import { Cart } from "components/Cart";
import { Head } from "components/Head";
import { Header } from "components/Header";
import { RestaurantCuisine } from "components/RestaurantCuisine";
import { RestaurantMenuItem } from "components/RestaurantMenuItem";
import { RestaurantMenuItemModal } from "components/RestaurantMenuItemModal";
import { RestaurantOpeningHours } from "components/RestaurantOpeningHours";
import { RestaurantPhoneNumber } from "components/RestaurantPhoneNumber";
import { RestaurantPickAndDelivery } from "components/RestaurantPickAndDelivery";
import { Select } from "components/Select";
import { Toolbar } from "components/Toolbar";
import { useUserContext } from "hooks/useUserContext";
import { restaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";
import { db } from "lib/server/db";
import { toApiMenuItem } from "lib/server/toApiMenuItem";
import { toApiRestaurant } from "lib/server/toApiRestaurant";
import { urlParamToRestaurantName } from "lib/urlParamToRestaurantName";
import type { ApiMenuItem, ApiRestaurant, MenuItem, Restaurant } from "types";

interface RestaurantDetailPageProps {
  restaurant: ApiRestaurant;
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
        if (a.outOfStock && !b.outOfStock) {
          return 1;
        } else if (!a.outOfStock && b.outOfStock) {
          return -1;
        }

        if (a.picture && !b.picture) {
          return -1;
        } else if (!a.picture && b.picture) {
          return 1;
        }

        const aTextLength = a.name.length + (a.mealDescription?.length ?? 0);
        const bTextLength = b.name.length + (b.mealDescription?.length ?? 0);

        return bTextLength - aTextLength;
      }),
    };
  });

  const restaurant = restaurantDoc.data() as Restaurant;

  return {
    props: {
      restaurant: toApiRestaurant(restaurant),
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
  const headerRef = useRef<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaTopRef = useRef<HTMLDivElement | null>(null);
  const { getDistanceToCoordinates } = useUserContext();
  const [selectedCategory, setSelectedCategory] = useState(
    menu.find(({ category }) => !!category)?.category ?? ""
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<ApiMenuItem>();
  const scrollOffsetRef = useRef(0);

  const distance = getDistanceToCoordinates({
    latitude: parseFloat(restaurant.Latitude),
    longitude: parseFloat(restaurant.Longitude),
  });

  restaurant.distance = distance ?? undefined;

  const isAddressVisible = !!restaurant.Address;
  const isDistanceVisible = typeof distance === "number" && !isNaN(distance);
  const isWebsiteVisible = !!restaurant.Website;

  const handleCategoryScrollChange = (to: string) => {
    if (!isScrolling) {
      setSelectedCategory(to);
    }
  };

  useEffect(() => {
    scrollSpy.update();

    Events.scrollEvent.register("begin", () => {
      setIsScrolling(true);
    });

    Events.scrollEvent.register("end", () => {
      setIsScrolling(false);
    });

    scrollOffsetRef.current = -(
      (toolbarRef.current?.getBoundingClientRect().height ?? 0) +
      (headerRef.current?.getBoundingClientRect().height ?? 0)
    );

    return () => {
      Events.scrollEvent.remove("begin");
      Events.scrollEvent.remove("end");
    };
  }, []);

  return (
    <>
      <Head
        titles={[restaurant.Restaurant]}
        description={"Vegan dining and delivery"}
        ogMetadata={{
          title: restaurant.Restaurant,
          image: restaurant.Image ?? "",
          type: "website",
          url: `https://www.livebetterphl.com/restaurant-detail/${restaurantNameToUrlParam(
            restaurant.Restaurant
          )}`,
        }}
      ></Head>
      <main className="flex flex-col mb-6">
        <Header ref={headerRef} />
        <section className="flex flex-col gap-0 container mx-auto">
          <Toolbar ref={toolbarRef} scrollAreaTopRef={scrollAreaTopRef}>
            <div className="flex flex-col gap-1 sm:gap-4 md:flex-row justify-between md:items-center">
              <h2 className="text-2xl sm:text-4xl font-bold">
                {restaurant.Restaurant}
              </h2>
              <Select
                onChange={(event) => {
                  setSelectedCategory(event.target.value);

                  scroller.scrollTo(event.target.value, {
                    smooth: true,
                    offset: scrollOffsetRef.current,
                  });
                }}
                value={selectedCategory}
              >
                {menu.map(({ category }) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
            {menu.map(({ category }) => (
              // These Links are only used for their `onSetActive` callback,
              // combined with the `spy` functionality. It is the only way to
              // get notified when the user enters a new section. In the UI,
              // they are hidden.
              <Link
                className="hidden"
                offset={scrollOffsetRef.current}
                spy={true}
                to={category}
                key={category}
                onSetActive={handleCategoryScrollChange}
              >
                {category}
              </Link>
            ))}
          </Toolbar>
          <div ref={scrollAreaTopRef}></div>
          <div className="flex flex-col gap-6 px-4 sm:px-6">
            <div className="grid gap-6">
              {restaurant.Image && (
                <div
                  className="h-52 sm:h-80 rounded-lg overflow-hidden flex-none flex xl:flex-grow"
                  style={{ gridArea: "1/1" }}
                >
                  <Image
                    alt=""
                    className="w-full object-cover"
                    height={640}
                    priority={true}
                    src={restaurant.Image}
                    width={960}
                  />
                </div>
              )}
              <section
                className={`
                  flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 sm:pr-5
                  rounded-r-lg
                  justify-center justify-self-start self-center
                  bg-white/80 backdrop-blur
                `}
                style={{ gridArea: "1/1" }}
              >
                <div className="flex flex-col gap-1 sm:gap-2">
                  <RestaurantOpeningHours restaurant={restaurant} />
                  <RestaurantPickAndDelivery restaurant={restaurant} />
                  <RestaurantCuisine restaurant={restaurant} />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  {isAddressVisible || isDistanceVisible ? (
                    <div className="flex gap-2 items-center">
                      <MapPin
                        className="flex-none w-[16px] sm:w-[20px] text-black"
                        size={20}
                        color="currentColor"
                      />
                      <p className="text-sm sm:text-base flex items-center gap-2">
                        {isDistanceVisible ? `${distance} mi` : null}
                        {isDistanceVisible && isAddressVisible ? " ∙ " : null}
                        {isAddressVisible ? restaurant.Address : null}
                      </p>
                    </div>
                  ) : null}
                  <RestaurantPhoneNumber restaurant={restaurant} />
                  {isWebsiteVisible ? (
                    <div className="flex gap-2 items-center">
                      <Browser
                        className="flex-none w-[16px] sm:w-[20px] text-black"
                        size={20}
                        color="currentColor"
                      />
                      <a
                        href={restaurant.Website}
                        className="text-sm sm:text-base underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {restaurant.Website}
                      </a>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
            {menu && (
              <div className="flex flex-col gap-7">
                {menu.map(({ category, menuItems }) => {
                  return (
                    <section key={category}>
                      <Element name={category} className="flex flex-col gap-3">
                        <h4 className="text-xl sm:text-3xl uppercase font-bold">
                          {category}
                        </h4>
                        <ul className="grid grid-cols-12 gap-4">
                          {menuItems.map((menuItem, index) => (
                            <RestaurantMenuItem
                              key={index}
                              menuItem={menuItem}
                              onClick={() => {
                                setSelectedMenuItem(menuItem);
                                setIsMenuItemModalOpen(true);
                              }}
                            />
                          ))}
                        </ul>
                      </Element>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
          <Cart className="mt-4" />
        </section>
      </main>
      <RestaurantMenuItemModal
        restaurant={restaurant}
        menuItem={selectedMenuItem}
        isOpen={isMenuItemModalOpen}
        onRequestClose={() => {
          setIsMenuItemModalOpen(false);
        }}
      />
    </>
  );
};

export default RestaurantDetail;
