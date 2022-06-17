import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";
import type { ApiRestaurant } from "types";

export const sortApiRestaurants = (
  a: ApiRestaurant,
  b: ApiRestaurant
): number => {
  // Handle basic sorting based on the two restaurants having different
  // opening hours statuses. For example, if restaurant A is open later today,
  // but restaurant B is open now, restaurant B should appear first.
  const aStatus = getOpeningHoursInfo(a).status;
  const bStatus = getOpeningHoursInfo(b).status;

  if (
    (aStatus === "open-now" || aStatus === "closes-after-midnight") &&
    !(bStatus === "open-now" || bStatus === "closes-after-midnight")
  ) {
    return -1;
  } else if (
    !(aStatus === "open-now" || aStatus === "closes-after-midnight") &&
    (bStatus === "open-now" || bStatus === "closes-after-midnight")
  ) {
    return 1;
  }

  if (aStatus === "open-later" && bStatus !== "open-later") {
    return -1;
  } else if (aStatus !== "open-later" && bStatus === "open-later") {
    return 1;
  }

  if (aStatus === "closed-earlier" && bStatus !== "closed-earlier") {
    return -1;
  } else if (aStatus !== "closed-earlier" && bStatus === "closed-earlier") {
    return 1;
  }

  // Both restaurants have identical opening hours statuses after this point.

  // Restaurants with a Tracking property should be sorted above those
  // without one. If both have a Tracking property, the restaurant with
  // the higher number appears first
  if (typeof a.Tracking === "number" && typeof b.Tracking !== "number") {
    return -1;
  } else if (typeof a.Tracking !== "number" && typeof b.Tracking === "number") {
    return 1;
  } else if (typeof a.Tracking === "number" && typeof b.Tracking === "number") {
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

  return 0;
};
