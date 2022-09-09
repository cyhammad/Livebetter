import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { MAX_DELIVERY_RANGE } from "lib/constants";
import { getDistanceInMiles } from "lib/getDistanceInMiles";
import { db } from "lib/server/db";
import { sortApiRestaurants } from "lib/sortApiRestaurants";
import type {
  ApiRestaurant,
  FeaturedSection,
  GetFeaturedApiRestaurants,
  Restaurant,
} from "types";

import { toApiRestaurant } from "./toApiRestaurant";

export const getFeaturedApiRestaurants: GetFeaturedApiRestaurants = async (
  options
) => {
  let { sectionKeys = [] } = options || {};
  const { sortByDistanceFrom } = options || {};
  const apiRestaurantsMap = new Map<string, ApiRestaurant>();

  function addApiRestaurant(doc: QueryDocumentSnapshot<DocumentData>) {
    const restaurant = doc.data() as Restaurant;
    const apiRestaurant: ApiRestaurant = toApiRestaurant(restaurant);

    if (sortByDistanceFrom && restaurant.Latitude && restaurant.Longitude) {
      apiRestaurant.distance = getDistanceInMiles(sortByDistanceFrom, {
        latitude: parseFloat(restaurant.Latitude),
        longitude: parseFloat(restaurant.Longitude),
      });
    }

    apiRestaurantsMap.set(doc.id, apiRestaurant);
  }

  if (sectionKeys.includes("tracking")) {
    sectionKeys = sectionKeys.filter((sectionKey) => sectionKey !== "tracking");

    const trackingRestaurantDocs = await getDocs(
      query(
        collection(db, "Restaurants Philadelphia"),
        where("isDeliveryAvailable", "==", true)
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

  const sections = [...apiRestaurantsMap.values()]
    .sort(sortApiRestaurants)
    .reduce((acc, curr) => {
      if (curr.featured_in) {
        for (const sectionKey of curr.featured_in) {
          if (!acc[sectionKey]) {
            acc[sectionKey] = [];
          }

          acc[sectionKey].push(curr);
        }
      }

      if (
        curr.isDeliveryAvailable &&
        (typeof curr.distance === "number"
          ? curr.distance <= MAX_DELIVERY_RANGE
          : true)
      ) {
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
