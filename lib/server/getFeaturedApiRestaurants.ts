import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
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
  let { sectionKeys = [] } = options || {};
  const { limit, offset = 0, sortByDistanceFrom } = options || {};
  let apiRestaurants: ApiRestaurant[] = [];

  function addApiRestaurant(doc: QueryDocumentSnapshot<DocumentData>) {
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
  }

  if (sectionKeys.includes("tracking")) {
    sectionKeys = sectionKeys.filter((sectionKey) => sectionKey !== "tracking");

    const trackingRestaurantDocs = await getDocs(
      query(
        collection(db, "Restaurants Philadelphia"),
        where("Tracking", ">=", 0)
      )
    );

    trackingRestaurantDocs.docs.forEach(addApiRestaurant);
  }

  const featuredRestaurantDocs = await getDocs(
    query(
      collection(db, "Restaurants Philadelphia"),
      where("featured_in", "array-contains-any", sectionKeys)
    )
  );

  featuredRestaurantDocs.docs.forEach(addApiRestaurant);

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
    } else if (curr.Tracking) {
      if (!acc["tracking"]) {
        acc["tracking"] = [];
      }

      acc["tracking"].push(curr);
    }

    return acc;
  }, {} as Record<FeaturedSection, ApiRestaurant[]>);

  return {
    sections,
  };
};
