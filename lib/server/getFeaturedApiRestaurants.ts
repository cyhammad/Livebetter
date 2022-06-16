import { collection, getDocs, query, where } from "firebase/firestore";
import haversineDistance from "haversine-distance";

import { db } from "lib/server/db";
import { sortApiRestaurants } from "lib/sortApiRestaurants";
import type {
  ApiRestaurant,
  FeaturedSection,
  GetFeaturedApiRestaurants,
  Restaurant,
} from "types";

const METERS_TO_MILES_DIVISOR = 1609.344;

export const getFeaturedApiRestaurants: GetFeaturedApiRestaurants = async (
  options
) => {
  const {
    limit,
    offset = 0,
    sectionKeys = [],
    sortByDistanceFrom,
  } = options || {};

  const restaurantDocs = await getDocs(
    query(
      collection(db, "Restaurants Philadelphia"),
      where("featured_in", "array-contains-any", sectionKeys)
    )
  );

  let apiRestaurants: ApiRestaurant[] = [];

  restaurantDocs.docs.forEach((doc) => {
    const restaurant = doc.data() as Restaurant;
    const apiRestaurant: ApiRestaurant = { ...restaurant };

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

  apiRestaurants = apiRestaurants.sort(sortApiRestaurants);

  if (limit) {
    apiRestaurants = apiRestaurants.slice(offset, limit + offset);
  }

  const sections = apiRestaurants.reduce((acc, curr) => {
    if (curr.featured_in) {
      for (const sectionKey of curr.featured_in) {
        if (!acc[sectionKey]) {
          acc[sectionKey] = [];
        }

        acc[sectionKey].push(curr);
      }
    }

    return acc;
  }, {} as Record<FeaturedSection, ApiRestaurant[]>);

  return {
    sections,
  };
};
