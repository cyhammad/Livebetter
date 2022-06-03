import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Clock,
  MapPin,
  Taxi,
  PersonSimpleWalk,
} from "phosphor-react";

import type { ApiRestaurant } from "types";
import { restaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";
import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";

interface RestaurantCardProps {
  className?: string;
  restaurant: ApiRestaurant;
}

export const RestaurantCard = ({
  className,
  restaurant,
}: RestaurantCardProps) => {
  const isAddressVisible = !!restaurant.Address;
  const isDistanceVisible =
    typeof restaurant.distance === "number" && !isNaN(restaurant.distance);
  const isCuisineVisible = !!restaurant.Cuisine;

  const { label: openingHoursLabel, status } = getOpeningHoursInfo(restaurant);

  return (
    <Link
      href={`/restaurant-detail/${encodeURIComponent(
        restaurantNameToUrlParam(restaurant.Restaurant)
      )}`}
    >
      <a
        className={classNames({
          [className ?? ""]: true,
          "flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5 justify-items-stretch":
            true,
          "opacity-60": ["closed-today", "closed-earlier"].includes(status),
        })}
      >
        <div className={"flex flex-col gap-2 sm:gap-3 sm:w-52 md:w-80 lg:w-96"}>
          {restaurant.Image && (
            <div className="w-full h-44 sm:w-52 sm:h-52 md:w-80 md:h-52 lg:w-96 rounded-lg overflow-hidden flex-none flex">
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
          <div className="flex flex-col gap-0.5 sm:gap-2">
            <h3 className="text-xl font-bold sm:text-2xl">
              {restaurant.Restaurant}
            </h3>
            {restaurant.isDeliveryAvailable || restaurant.isPickUpAvailable ? (
              <div className="flex gap-1 items-top text-sm sm:text-base">
                {restaurant.isDeliveryAvailable ? (
                  <div className="flex gap-2 items-start">
                    <Taxi
                      className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
                      size={20}
                      color={"#000000"}
                    />
                    <p className=" flex items-center gap-2">
                      {restaurant.distance
                        ? restaurant.distance <= 3
                          ? "Delivery"
                          : "No delivery at your location"
                        : "Delivery within 3 miles"}
                    </p>
                  </div>
                ) : null}
                {restaurant.isDeliveryAvailable && restaurant.isPickUpAvailable
                  ? " ∙ "
                  : null}
                {restaurant.isPickUpAvailable ? (
                  <div className="flex gap-2 items-start">
                    <PersonSimpleWalk
                      className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
                      size={20}
                      color={"#000000"}
                    />
                    <p className=" flex items-center gap-2">Pickup</p>
                  </div>
                ) : null}
              </div>
            ) : null}
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
              <div className="flex gap-2 items-start">
                <MapPin
                  className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
                  size={20}
                  color={"#000000"}
                />
                <p className="text-sm sm:text-base flex items-center gap-2">
                  {isDistanceVisible ? `${restaurant.distance} mi` : null}
                  {isDistanceVisible && isAddressVisible ? " ∙ " : null}
                  {isAddressVisible ? restaurant.Address : null}
                </p>
              </div>
            ) : null}
            {isCuisineVisible ? (
              <div className="flex gap-2 items-start">
                <Activity
                  className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
                  size={20}
                  color={"#000000"}
                />
                <p className="text-sm sm:text-base line-clamp-2">
                  {restaurant.Cuisine}
                </p>
              </div>
            ) : null}
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
