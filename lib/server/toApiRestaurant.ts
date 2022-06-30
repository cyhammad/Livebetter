import haversineDistance from "haversine-distance";

import type { ApiRestaurant, Coordinates, Restaurant } from "types";

const METERS_TO_MILES_DIVISOR = 1609.344;

export const toApiRestaurant = (
  restaurant: Restaurant,
  addDistanceFrom?: Coordinates
): ApiRestaurant => {
  const apiRestaurant: ApiRestaurant = { ...restaurant };

  if (restaurant.Cuisine) {
    apiRestaurant.cuisines = restaurant.Cuisine.toLowerCase().split(", ");
  }

  if (addDistanceFrom && restaurant.Latitude && restaurant.Longitude) {
    const distanceInMiles =
      haversineDistance(addDistanceFrom, {
        latitude: parseFloat(restaurant.Latitude),
        longitude: parseFloat(restaurant.Longitude),
      }) / METERS_TO_MILES_DIVISOR;

    apiRestaurant.distance = Math.floor(distanceInMiles * 100) / 100;
  }

  return apiRestaurant;
};
