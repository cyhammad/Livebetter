import { Activity } from "phosphor-react";

import type { ApiRestaurant } from "types";

interface RestaurantCuisineProps {
  restaurant: ApiRestaurant;
}

export const RestaurantCuisine = ({ restaurant }: RestaurantCuisineProps) => {
  if (!restaurant.Cuisine) {
    return null;
  }

  return (
    <div className="flex gap-2 items-start">
      <Activity
        className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px] text-black"
        size={20}
        color="currentColor"
      />
      <p className="text-sm sm:text-base line-clamp-1" itemProp="servesCuisine">
        {restaurant.Cuisine}
      </p>
    </div>
  );
};
