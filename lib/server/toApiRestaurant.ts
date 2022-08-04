import { getDistanceInMiles } from "lib/getDistanceInMiles";
import type { ApiRestaurant, Coordinates, Restaurant } from "types";

export const toApiRestaurant = (
  restaurant: Restaurant,
  addDistanceFrom?: Coordinates
): ApiRestaurant => {
  const apiRestaurant: ApiRestaurant = { ...restaurant };

  if (restaurant.Cuisine) {
    apiRestaurant.cuisines = restaurant.Cuisine.toLowerCase().split(", ");
  }

  if (addDistanceFrom && restaurant.Latitude && restaurant.Longitude) {
    apiRestaurant.distance = getDistanceInMiles(addDistanceFrom, {
      latitude: parseFloat(restaurant.Latitude),
      longitude: parseFloat(restaurant.Longitude),
    });
  }

  return apiRestaurant;
};
