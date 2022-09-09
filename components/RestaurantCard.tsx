import classNames from "classnames";
import Image from "next/future/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "phosphor-react";

import { HorizontalStackWithSeparator } from "components/HorizontalStackWithSeparator";
import { RestaurantCuisine } from "components/RestaurantCuisine";
import { RestaurantOpeningHours } from "components/RestaurantOpeningHours";
import { RestaurantPickAndDelivery } from "components/RestaurantPickAndDelivery";
import { MAX_DELIVERY_RANGE } from "lib/constants";
import { getDeliveryFee } from "lib/getDeliveryFee";
import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";
import { getWaitTimeMinMax } from "lib/getWaitTimeMinMax";
import { restaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";
import type { ApiRestaurant } from "types";

interface RestaurantCardProps {
  className?: string;
  restaurant: ApiRestaurant;
  layout?: "vertical" | "auto";
}

export const RestaurantCard = ({
  className,
  layout = "auto",
  restaurant,
}: RestaurantCardProps) => {
  const { status, isOpen } = getOpeningHoursInfo(restaurant);

  let addressLabel = "";
  let deliveryFeeLabel = "";
  let distanceLabel = "";
  let waitTimeLabel = "";

  if (typeof restaurant.distance === "number" && !isNaN(restaurant.distance)) {
    distanceLabel = `${restaurant.distance} mi`;
  }

  if (restaurant.isDeliveryAvailable && isOpen) {
    if (restaurant.waitTime) {
      const [minWaitTime, maxWaitTime] = getWaitTimeMinMax(restaurant.waitTime);

      waitTimeLabel = `${minWaitTime}-${maxWaitTime} min`;
    }

    if (restaurant.distance && restaurant.distance <= MAX_DELIVERY_RANGE) {
      deliveryFeeLabel = `$${getDeliveryFee(restaurant.distance)} delivery fee`;
    }
  }

  if (!deliveryFeeLabel) {
    const addressParts = restaurant.Address.split(", ");

    addressParts.pop();

    addressLabel = addressParts.join(", ");
  }

  return (
    <div itemScope itemType="https://schema.org/Restaurant">
      <Link
        href={`/restaurant-detail/${restaurantNameToUrlParam(
          restaurant.Restaurant
        )}`}
      >
        <a
          className={classNames({
            [className ?? ""]: true,
            "flex flex-col gap-3 justify-items-stretch": true,
            "sm:flex-row sm:items-center sm:gap-5": layout === "auto",
            "w-80 sm:w-96": layout === "vertical",
            "opacity-60": ["closed-today", "closed-earlier"].includes(status),
          })}
          itemProp="url"
        >
          <div
            className={classNames("flex flex-col", {
              "sm:w-52 md:w-80 lg:w-96": layout === "auto",
              "w-80 sm:w-96": layout === "vertical",
            })}
          >
            {restaurant.Image && (
              <div
                className={classNames(
                  "w-full h-44 sm:h-52 rounded-lg overflow-hidden flex-none flex",
                  {
                    "md:w-80 lg:w-96": layout === "auto",
                  }
                )}
              >
                <Image
                  className="w-full object-cover"
                  height={155}
                  width={320}
                  src={restaurant.Image}
                  alt=""
                  itemProp="image"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h3
              className="text-xl font-bold sm:text-2xl sm:mb-0 leading-6 sm:leading-8 capitalize"
              itemProp="name"
            >
              {restaurant.Restaurant.toLowerCase()}
              {process.env.NODE_ENV === "development" ? (
                <small>
                  <sup>
                    {restaurant.Tracking ? `(${restaurant.Tracking})` : null}
                  </sup>
                </small>
              ) : null}
            </h3>
            <RestaurantOpeningHours restaurant={restaurant} />
            <RestaurantPickAndDelivery restaurant={restaurant} />
            {distanceLabel ||
            waitTimeLabel ||
            deliveryFeeLabel ||
            addressLabel ? (
              <div className="flex gap-2 items-start">
                <MapPin
                  className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px] text-black"
                  size={20}
                  color="currentColor"
                />
                <p className="text-sm sm:text-base line-clamp-1">
                  <HorizontalStackWithSeparator
                    separator=" • "
                    parts={[
                      distanceLabel,
                      waitTimeLabel,
                      deliveryFeeLabel,
                      addressLabel ? (
                        <span itemProp="address">{addressLabel}</span>
                      ) : null,
                    ]}
                  />
                </p>
              </div>
            ) : null}
            <RestaurantCuisine restaurant={restaurant} />
            <p className="hidden sm:flex gap-1 items-center flex-none text-sm sm:text-base whitespace-nowrap underline underline-offset-4">
              View Menu{" "}
              <ArrowRight
                className="flex-none w-[16px] sm:w-[20px]"
                size={20}
              />
            </p>
          </div>
        </a>
      </Link>
    </div>
  );
};
