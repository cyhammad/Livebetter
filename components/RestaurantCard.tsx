import classNames from "classnames";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowRight, Clock, MapPin, Notebook } from "phosphor-react";

import type { ApiRestaurant } from "types";
import { openAndCloseDates } from "lib/isOpen";
import { restaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";

interface RestaurantCardProps {
  className?: string;
  restaurant: ApiRestaurant;
}

export const RestaurantCard = ({
  className,
  restaurant,
}: RestaurantCardProps) => {
  const [_, closeDate] = openAndCloseDates(restaurant);

  const isOpenHoursVisible = !!closeDate;
  const isAddressVisible = !!restaurant.Address;
  const isDistanceVisible =
    typeof restaurant.distance === "number" && !isNaN(restaurant.distance);
  const isCuisineVisible = !!restaurant.Cuisine;
  const isItemsVisible = !!restaurant.Items;

  return (
    <div
      className={classNames({
        [className ?? ""]: true,
        "flex flex-col sm:flex-row sm:gap-5 justify-items-stretch": true,
      })}
      key={restaurant.Restaurant}
    >
      <div className={"flex flex-col gap-3 sm:w-[320px]"}>
        {restaurant.Image && (
          <div className="w-full sm:w-[320px] h-[155px] rounded-lg overflow-hidden flex-none flex">
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
        <h3 className="text-xl font-bold sm:text-2xl">
          {restaurant.Restaurant}
        </h3>
      </div>
      <div className="flex flex-col gap-2 sm:gap-4 mt-2 w-full">
        <div className="flex flex-col gap-1 sm:gap-2">
          {isOpenHoursVisible ? (
            <div className="flex gap-2 items-start">
              <Clock
                className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
                size={20}
                color={"#000000"}
              />
              <p className="text-sm sm:text-base flex items-center gap-2">
                {new Date() < closeDate ? (
                  <>Open for {formatDistanceToNow(closeDate)}</>
                ) : (
                  <>Closed {formatDistanceToNow(closeDate)} ago</>
                )}
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
          {isItemsVisible ? (
            <div className="flex gap-2 items-start">
              <Notebook
                className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
                size={20}
                color={"#000000"}
              />
              <p className="text-sm sm:text-base line-clamp-2">
                {restaurant.Items}
              </p>
            </div>
          ) : null}
        </div>
        <div className="ml-6 sm:ml-7">
          <Link
            href={`/restaurant-detail/${encodeURIComponent(
              restaurantNameToUrlParam(restaurant.Restaurant)
            )}`}
          >
            <a className="flex gap-1 items-center flex-none text-sm sm:text-base whitespace-nowrap underline underline-offset-4">
              View Menu{" "}
              <ArrowRight
                className="flex-none w-[16px] sm:w-[20px]"
                size={20}
              />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};
