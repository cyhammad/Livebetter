import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "phosphor-react";

import { RestaurantCuisine } from "components/RestaurantCuisine";
import { RestaurantOpeningHours } from "components/RestaurantOpeningHours";
import { RestaurantPickAndDelivery } from "components/RestaurantPickAndDelivery";
import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";
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
  const isAddressVisible = !!restaurant.Address;
  const isDistanceVisible =
    typeof restaurant.distance === "number" && !isNaN(restaurant.distance);

  const { status } = getOpeningHoursInfo(restaurant);

  return (
    <Link
      href={`/restaurant-detail/${encodeURIComponent(
        restaurantNameToUrlParam(restaurant.Restaurant)
      )}`}
    >
      <a
        className={classNames({
          [className ?? ""]: true,
          "flex flex-col gap-1 justify-items-stretch": true,
          "sm:flex-row sm:items-center sm:gap-5": layout === "auto",
          "opacity-60": ["closed-today", "closed-earlier"].includes(status),
        })}
      >
        <div
          className={classNames("flex flex-col gap-2 sm:gap-3 ", {
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
                layout="raw"
                height={155}
                width={320}
                src={restaurant.Image}
                alt=""
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:gap-4 w-full">
          <div className="flex flex-col gap-1 sm:gap-2">
            <h3 className="text-xl font-bold sm:text-2xl -mb-0.5 sm:mb-0">
              {restaurant.Restaurant}
            </h3>
            <RestaurantOpeningHours restaurant={restaurant} />
            <RestaurantPickAndDelivery restaurant={restaurant} />
            {isAddressVisible || isDistanceVisible ? (
              <div className="flex gap-2 items-start">
                <MapPin
                  className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px] text-black"
                  size={20}
                  color="currentColor"
                />
                <p className="text-sm sm:text-base flex items-center gap-2">
                  {isDistanceVisible ? `${restaurant.distance} mi` : null}
                  {isDistanceVisible && isAddressVisible ? " ∙ " : null}
                  {isAddressVisible ? restaurant.Address : null}
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
        </div>
      </a>
    </Link>
  );
};
