import { collection, getDocs, query, where } from "firebase/firestore";
import haversineDistance from "haversine-distance";

import { db } from "lib/server/db";
import type { ApiRestaurant, Restaurant, GetApiRestaurants } from "types";
import { isOpen } from "lib/isOpen";

const METERS_TO_MILES_DIVISOR = 1609.344;

export const getApiRestaurants: GetApiRestaurants = async (options) => {
  const {
    cuisines: filteredCuisines,
    limit,
    offset = 0,
    search,
    sortByDistanceFrom,
  } = options || {};

  const queryConstraints = search
    ? [
        where("Restaurant", ">=", search.toUpperCase()),
        where("Restaurant", "<=", search.toUpperCase() + "~"),
      ]
    : [];

  const restaurantDocs = await getDocs(
    query(collection(db, "Restaurants Philadelphia"), ...queryConstraints)
  );

  let apiRestaurants: ApiRestaurant[] = [];
  const cuisines = new Set<string>();

  restaurantDocs.docs.forEach((doc) => {
    const restaurant = doc.data() as Restaurant;
    const apiRestaurant: ApiRestaurant = { ...restaurant };

    if (restaurant.Cuisine) {
      apiRestaurant.cuisines = restaurant.Cuisine.toLowerCase().split(", ");

      // Filter out restaurants that do not have any cuisines in common with
      // the `filteredCuisines` parameter
      if (
        filteredCuisines &&
        filteredCuisines.length > 0 &&
        !filteredCuisines.every((cuisine) =>
          apiRestaurant.cuisines?.includes(cuisine)
        )
      ) {
        return;
      }

      apiRestaurant.cuisines.forEach((cuisineItem) => {
        cuisines.add(cuisineItem);
      });
    }

    if (sortByDistanceFrom && restaurant.Latitude && restaurant.Longitude) {
      const distanceInMiles =
        haversineDistance(sortByDistanceFrom, {
          latitude: parseFloat(restaurant.Latitude),
          longitude: parseFloat(restaurant.Longitude),
        }) / METERS_TO_MILES_DIVISOR;

      apiRestaurant.distance = Math.floor(distanceInMiles * 100) / 100;
    }

    apiRestaurants.push(apiRestaurant);
  });

  apiRestaurants = apiRestaurants.sort((a, b) => {
    const isAOpen = isOpen(a);
    const isBOpen = isOpen(b);

    if (isAOpen && !isBOpen) {
      return -1;
    } else if (!isAOpen && isBOpen) {
      return 1;
    } else if (a.distance && b.distance) {
      return a.distance - b.distance;
    }

    return 0;
  });

  if (limit) {
    apiRestaurants = apiRestaurants.slice(offset, limit);
  }

  return {
    cuisines: [...cuisines].sort((a, b) => (a < b ? -1 : 1)),
    restaurants: apiRestaurants,
  };
};
