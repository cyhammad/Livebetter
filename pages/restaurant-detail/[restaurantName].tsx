import classNames from "classnames";
import { collection, getDocs } from "firebase/firestore";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/future/image";
import { Browser, MapPin } from "phosphor-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Element, Events, Link, scrollSpy, scroller } from "react-scroll";

import { Cart } from "components/Cart";
import { ContactInfoModal } from "components/ContactInfoModal";
import { Footer } from "components/Footer";
import { Head } from "components/Head";
import { Header } from "components/Header";
import { ModalGroupOverlay } from "components/ModalGroupOverlay";
import { RestaurantCuisine } from "components/RestaurantCuisine";
import { RestaurantMenuItem } from "components/RestaurantMenuItem";
import { RestaurantMenuItemModal } from "components/RestaurantMenuItemModal";
import { RestaurantOpeningHours } from "components/RestaurantOpeningHours";
import { RestaurantPhoneNumber } from "components/RestaurantPhoneNumber";
import { RestaurantPickAndDelivery } from "components/RestaurantPickAndDelivery";
import { Select } from "components/Select";
import { Toolbar } from "components/Toolbar";
import { useCartContext } from "hooks/useCartContext";
import { usePrevious } from "hooks/usePrevious";
import { useUserContext } from "hooks/useUserContext";
import { notNullOrUndefined } from "lib/notNullOrUndefined";
import { restaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";
import { db } from "lib/server/db";
import { findRestaurant } from "lib/server/findRestaurant";
import { toApiMenuItem } from "lib/server/toApiMenuItem";
import { toApiRestaurant } from "lib/server/toApiRestaurant";
import { urlParamToRestaurantName } from "lib/urlParamToRestaurantName";
import type {
  ApiMenuItem,
  ApiRestaurant,
  MenuItem,
  MenuItemData,
  Restaurant,
} from "types";

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

  if (!restaurantName) {
    return {
      notFound: true,
    };
  }

  const restaurantDoc = await findRestaurant(restaurantName);

  if (!restaurantDoc) {
    return {
      notFound: true,
    };
  }

  const restaurantMenuDocs = await getDocs(
    collection(restaurantDoc.ref, "Restaurant_Menu")
  );

  const menuItemsByCategory: Record<string, ApiMenuItem[]> = {};

  restaurantMenuDocs.docs
    .map((doc) => toApiMenuItem(doc.id, doc.data() as MenuItem))
    .sort((a: ApiMenuItem, b: ApiMenuItem) => {
      const aCategory = a.category?.toLowerCase() ?? "";
      const bCategory = b.category?.toLowerCase() ?? "";
      const isANonVegan =
        aCategory.includes("non vegan") || a.isVegan === false;
      const isBNonVegan =
        bCategory.includes("non vegan") || b.isVegan === false;

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

  const restaurant = restaurantDoc.data();

  return {
    props: {
      restaurant: toApiRestaurant(restaurant),
      menu,
    },
    // Regenerate the page every 2 minutes (2 * 60 seconds)
    revalidate: 2 * 60,
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
  const [menuItemData, setMenuItemData] = useState<MenuItemData>();
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentModal, setCurrentModal] = useState<"menu-item" | "contact">();
  const [selectedMenuItem, setSelectedMenuItem] = useState<ApiMenuItem>();
  const scrollOffsetRef = useRef(0);
  const { setShippingMethod } = useUserContext();
  const { addToCart } = useCartContext();
  const previousModal = usePrevious(currentModal);
  const [isNonVeganSectionVisible, setIsNonVeganSectionVisible] =
    useState(false);

  const distance = getDistanceToCoordinates({
    latitude: parseFloat(restaurant.Latitude),
    longitude: parseFloat(restaurant.Longitude),
  });

  restaurant.distance = distance ?? undefined;

  const isAddressVisible = !!restaurant.Address;
  const isDistanceVisible = typeof distance === "number" && !isNaN(distance);

  const handleCategoryScrollChange = (to: string) => {
    if (!isScrolling) {
      setSelectedCategory(to);
    }
  };

  const handleRequestClose = () => {
    setCurrentModal(undefined);
    setMenuItemData(undefined);
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

  let websiteUrl = null;

  try {
    websiteUrl = restaurant.Website
      ? new URL(restaurant.Website).toString()
      : null;
  } catch (err) {
    // Do nothing
  }

  const metaDescription =
    restaurant.isDeliveryAvailable && restaurant.isPickUpAvailable
      ? `Order delivery or pickup from  ${restaurant.Restaurant}`
      : restaurant.isDeliveryAvailable
      ? `Order delivery from  ${restaurant.Restaurant}`
      : restaurant.isPickUpAvailable
      ? `Order pickup from ${restaurant.Restaurant}`
      : `View ${restaurant.Restaurant}'s menu`;

  const allMenuItems = menu.flatMap(({ menuItems }) => menuItems);

  return (
    <>
      <Head
        titles={[restaurant.Restaurant]}
        description={metaDescription}
        ogMetadata={{
          description: metaDescription,
          title: restaurant.Restaurant,
          image: restaurant.Image ?? "",
          type: "website",
          url: `https://www.livebetterphl.com/restaurant-detail/${restaurantNameToUrlParam(
            restaurant.Restaurant
          )}`,
        }}
      ></Head>
      <main
        className="flex flex-col"
        itemScope
        itemType="https://schema.org/Restaurant"
      >
        <Header
          isNonVeganMenuVisible={isNonVeganSectionVisible}
          ref={headerRef}
        />
        <section className="flex flex-col gap-0 container mx-auto">
          <Toolbar ref={toolbarRef} scrollAreaTopRef={scrollAreaTopRef}>
            <div className="flex flex-col gap-1 sm:gap-4 md:flex-row justify-between md:items-center">
              <h2
                className="text-2xl sm:text-4xl font-bold capitalize"
                itemProp="name"
              >
                {restaurant.Restaurant.toLowerCase()}
              </h2>
              <Select
                className="md:text-lg"
                onChange={(event) => {
                  setSelectedCategory(event.target.value);

                  scroller.scrollTo(event.target.value, {
                    smooth: true,
                    offset: scrollOffsetRef.current,
                  });
                }}
                value={selectedCategory}
              >
                {menu.map(({ category, menuItems }) => {
                  const isSectionVegan = menuItems[0]?.isVegan !== false;

                  return (
                    <Fragment key={category}>
                      {!isSectionVegan && !isNonVeganSectionVisible ? null : (
                        <option value={category}>{category}</option>
                      )}
                    </Fragment>
                  );
                })}
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
                    itemProp="image"
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
                  <RestaurantOpeningHours
                    restaurant={restaurant}
                    shouldShowHoursList={true}
                  />
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
                      <p className="text-sm sm:text-base flex items-center gap-1">
                        {isDistanceVisible ? <span>{distance} mi</span> : null}
                        {isDistanceVisible && isAddressVisible ? "∙" : null}
                        {isAddressVisible ? (
                          <span itemProp="address">{restaurant.Address}</span>
                        ) : null}
                      </p>
                    </div>
                  ) : null}
                  <RestaurantPhoneNumber restaurant={restaurant} />
                  <div className="flex gap-2 items-center">
                    <Browser
                      className="flex-none w-[16px] sm:w-[20px] text-black"
                      size={20}
                      color="currentColor"
                    />
                    {websiteUrl ? (
                      <a
                        href={websiteUrl}
                        className="text-sm sm:text-base underline underline-offset-4"
                        target="_blank"
                        itemProp="sameAs"
                        rel="noopener"
                      >
                        {websiteUrl}
                      </a>
                    ) : (
                      <span className="text-sm sm:text-base">
                        Website unavailable
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>
            {menu && (
              <div
                className="flex flex-col gap-7"
                itemProp="hasMenu"
                itemScope
                itemType="https://schema.org/Menu"
              >
                {menu.map(({ category, menuItems }, sectionIndex) => {
                  const isSectionVegan = menuItems[0]?.isVegan !== false;
                  const isFirstNonVeganSection =
                    !isSectionVegan &&
                    menu[sectionIndex - 1]?.menuItems[0]?.isVegan !== false;

                  return (
                    <Fragment key={category}>
                      {isFirstNonVeganSection ? (
                        <button
                          className="w-auto bg-slate-100 py-3 px-4 rounded self-start text-slate-700"
                          type="button"
                          onClick={() =>
                            setIsNonVeganSectionVisible(
                              !isNonVeganSectionVisible
                            )
                          }
                        >
                          {isNonVeganSectionVisible
                            ? "Hide non-vegan items"
                            : "Eating with a non-vegan friend?"}
                        </button>
                      ) : null}
                      <section
                        className={classNames({
                          hidden: !isSectionVegan && !isNonVeganSectionVisible,
                        })}
                        itemProp="hasMenuSection"
                        itemScope
                        itemType="https://schema.org/MenuSection"
                      >
                        <Element
                          name={category}
                          className="flex flex-col gap-3"
                        >
                          <h4
                            className="text-xl sm:text-3xl font-bold"
                            itemProp="name"
                          >
                            {category}
                          </h4>
                          <ul className="grid grid-cols-12 gap-4">
                            {menuItems.map((menuItem, index) => (
                              <RestaurantMenuItem
                                key={index}
                                menuItem={menuItem}
                                onClick={() => {
                                  setSelectedMenuItem(menuItem);
                                  setCurrentModal("menu-item");
                                }}
                                role="button"
                              />
                            ))}
                          </ul>
                        </Element>
                      </section>
                    </Fragment>
                  );
                })}
              </div>
            )}
          </div>
          <Cart className="mt-4" />
        </section>
        <Footer className="mt-6" />
      </main>
      <ModalGroupOverlay
        isOpen={!!currentModal}
        onRequestClose={handleRequestClose}
      />
      <RestaurantMenuItemModal
        addOnItems={selectedMenuItem?.addOnItems
          ?.map((itemId) => allMenuItems.find((item) => item.name === itemId))
          .filter(notNullOrUndefined)}
        origin={
          [currentModal, previousModal].includes("contact")
            ? "carousel-left"
            : "default"
        }
        restaurant={restaurant}
        menuItem={selectedMenuItem}
        isOpen={currentModal === "menu-item"}
        onRequestClose={handleRequestClose}
        onRequestNext={(data) => {
          setMenuItemData(data);
          setShippingMethod(data.shippingMethod);

          if (data.shouldVerifyContactInfo) {
            setCurrentModal("contact");
          } else {
            data.menuItems.forEach(
              ({
                name: menuItemName,
                mealPrice: menuItemPrice,
                category: menuItemCategory,
                count,
                menuItemNotes,
                isVegan,
                choices,
                optionalChoices,
              }) => {
                addToCart(
                  restaurant,
                  menuItemName,
                  menuItemPrice,
                  menuItemCategory,
                  count,
                  menuItemNotes,
                  isVegan,
                  choices,
                  optionalChoices
                );
              }
            );

            handleRequestClose();
          }
        }}
      />
      <ContactInfoModal
        isOpen={currentModal === "contact"}
        onRequestClose={handleRequestClose}
        onRequestPrevious={() => setCurrentModal("menu-item")}
        onRequestNext={() => {
          if (menuItemData) {
            menuItemData.menuItems.forEach(
              ({
                name: menuItemName,
                mealPrice: menuItemPrice,
                category: menuItemCategory,
                count,
                menuItemNotes,
                isVegan,
                choices,
                optionalChoices,
              }) => {
                addToCart(
                  restaurant,
                  menuItemName,
                  menuItemPrice,
                  menuItemCategory,
                  count,
                  menuItemNotes,
                  isVegan,
                  choices,
                  optionalChoices
                );
              }
            );

            handleRequestClose();
          }
        }}
        origin={
          [currentModal, previousModal].includes("menu-item")
            ? "carousel-right"
            : "default"
        }
      />
    </>
  );
};

export default RestaurantDetail;
