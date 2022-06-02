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
    }

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

    apiRestaurant.cuisines?.forEach((cuisineItem) => {
      cuisines.add(cuisineItem);
    });

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
    } else {
      // a and b are either both open or both closed

      // Restaurants with a Tracking property should be sorted above those
      // without one. If both have a Tracking property, the restaurant with
      // the higher number appears first
      if (typeof a.Tracking === "number" && typeof b.Tracking !== "number") {
        return -1;
      } else if (
        typeof a.Tracking !== "number" &&
        typeof b.Tracking === "number"
      ) {
        return 1;
      } else if (
        typeof a.Tracking === "number" &&
        typeof b.Tracking === "number"
      ) {
        return b.Tracking - a.Tracking;
      }

      if (a.isDeliveryAvailable && !b.isDeliveryAvailable) {
        // Restaurants with delivery available go at the top
        return -1;
      } else if (!a.isDeliveryAvailable && b.isDeliveryAvailable) {
        return 1;
      } else if (a.isDeliveryAvailable && b.isDeliveryAvailable) {
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
      }

      if (a.isPickUpAvailable && !b.isPickUpAvailable) {
        // Restaurants with delivery available go at the top
        return -1;
      } else if (!a.isPickUpAvailable && b.isPickUpAvailable) {
        return 1;
      } else if (a.isPickUpAvailable && b.isPickUpAvailable) {
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
      }

      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
    }

    return 0;
  });

  if (limit) {
    apiRestaurants = apiRestaurants.slice(offset, limit + offset);
  }

  return {
    cuisines: [...cuisines].sort((a, b) => (a < b ? -1 : 1)),
    restaurants: apiRestaurants,
  };
};
