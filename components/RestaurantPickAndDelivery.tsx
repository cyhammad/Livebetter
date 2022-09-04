import { PersonSimpleWalk, Taxi } from "phosphor-react";

import type { ApiRestaurant } from "types";

interface RestaurantPickAndDeliveryProps {
  restaurant: ApiRestaurant;
}

export const RestaurantPickAndDelivery = ({
  restaurant,
}: RestaurantPickAndDeliveryProps) => {
  if (!(restaurant.isDeliveryAvailable || restaurant.isPickUpAvailable)) {
    return null;
  }

  return (
    <div className="flex gap-1 items-top text-sm sm:text-base">
      {restaurant.isDeliveryAvailable ? (
        <div className="flex gap-2 items-start">
          <Taxi
            className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px] text-black"
            size={20}
            color="currentColor"
          />
          <p className="flex items-center gap-2">
            {restaurant.distance
              ? restaurant.distance <= 4
                ? "Delivery"
                : "Outside delivery range"
              : "Delivery within 4 miles"}
          </p>
        </div>
      ) : null}
      {restaurant.isDeliveryAvailable && restaurant.isPickUpAvailable
        ? " ∙ "
        : null}
      {restaurant.isPickUpAvailable ? (
        <div className="flex gap-2 items-start">
          <PersonSimpleWalk
            className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px] text-black"
            size={20}
            color="currentColor"
          />
          <p className=" flex items-center gap-2">Pickup</p>
        </div>
      ) : null}
    </div>
  );
};
