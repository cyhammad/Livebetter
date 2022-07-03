import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "lib/server/db";
import { sortApiRestaurants } from "lib/sortApiRestaurants";
import type { ApiRestaurant, GetApiRestaurants, Restaurant } from "types";

import { toApiRestaurant } from "./toApiRestaurant";

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
    const apiRestaurant = toApiRestaurant(restaurant, sortByDistanceFrom);

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

    apiRestaurants.push(apiRestaurant);
  });

  apiRestaurants = apiRestaurants.sort(sortApiRestaurants);

  if (limit) {
    apiRestaurants = apiRestaurants.slice(offset, limit + offset);
  }

  return {
    cuisines: [...cuisines].sort((a, b) => (a < b ? -1 : 1)),
    restaurants: apiRestaurants,
  };
};
