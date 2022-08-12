import { getDistanceInMiles } from "lib/getDistanceInMiles";
import type {
  ApiRestaurant,
  ApiRestaurantOpenHours,
  Coordinates,
  Day,
  Restaurant,
  RestaurantOpenHours,
} from "types";

const days: Day[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const toApiRestaurant = (
  restaurant: Restaurant,
  addDistanceFrom?: Coordinates
): ApiRestaurant => {
  const apiRestaurant: ApiRestaurant = { ...restaurant };

  if (restaurant.Cuisine) {
    apiRestaurant.cuisines = restaurant.Cuisine.toLowerCase().split(", ");
  }

  if (restaurant.OpenHours) {
    let openHoursParsed: RestaurantOpenHours | null = null;

    try {
      openHoursParsed = JSON.parse(restaurant.OpenHours) as RestaurantOpenHours;
    } catch {
      // TODO Report error to Sentry
    }

    if (openHoursParsed) {
      const openHours = days.reduce((acc, dayName, index) => {
        if (!openHoursParsed) {
          return acc;
        }

        if (!openHoursParsed[`${index + 1}`]) {
          return { ...acc, [dayName]: null };
        }

        const hours = openHoursParsed[`${index + 1}`];

        const [openTime, closeTime] = hours.split("/");

        // Enforce that there should be two hours parts, like 11:00/20:30
        if (!openTime || !closeTime) {
          return { ...acc, [dayName]: null };
        }

        const openTimeParts = openTime.split(":");
        const closeTimeParts = closeTime.split(":");

        const openTimeHours = parseInt(openTimeParts[0]);
        const openTimeMinutes = parseInt(openTimeParts[1]);
        const closeTimeHours = parseInt(closeTimeParts[0]);
        const closeTimeMinutes = parseInt(closeTimeParts[1]);

        if (
          typeof openTimeHours !== "number" ||
          isNaN(openTimeHours) ||
          typeof openTimeMinutes !== "number" ||
          isNaN(openTimeMinutes) ||
          typeof closeTimeHours !== "number" ||
          isNaN(closeTimeHours) ||
          typeof closeTimeMinutes !== "number" ||
          isNaN(closeTimeMinutes)
        ) {
          return { ...acc, [dayName]: null };
        }

        return {
          ...acc,
          [dayName]: {
            openTime: [openTimeHours, openTimeMinutes],
            closeTime: [closeTimeHours, closeTimeMinutes],
          },
        };
      }, {} as ApiRestaurantOpenHours);

      apiRestaurant.openHours = openHours;
    }
  }

  if (addDistanceFrom && restaurant.Latitude && restaurant.Longitude) {
    apiRestaurant.distance = getDistanceInMiles(addDistanceFrom, {
      latitude: parseFloat(restaurant.Latitude),
      longitude: parseFloat(restaurant.Longitude),
    });
  }

  return apiRestaurant;
};
