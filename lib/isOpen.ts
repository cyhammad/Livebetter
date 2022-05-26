import type { Restaurant, RestaurantOpenHours } from "types";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import utcToZonedTime from "date-fns-tz/esm/utcToZonedTime";

export const openAndCloseDates = (
  restaurant: Restaurant,
  targetDate = new Date()
): [Date | null, Date | null] => {
  if (!restaurant.OpenHours) {
    return [null, null];
  }

  const openHours: RestaurantOpenHours = JSON.parse(restaurant.OpenHours);

  if (!openHours) {
    return [null, null];
  }

  const todayWeekday = `${targetDate.getDay() + 1}`;
  const todayHours = openHours[todayWeekday];

  if (!todayHours) {
    return [null, null];
  }

  const todayHoursParts = todayHours.split("/");
  const [openTime, closeTime] = todayHoursParts;

  // Enforce that there should be two hours parts, like 11:00/20:30
  if (!openTime || !closeTime) {
    return [null, null];
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
    return [null, null];
  }

  const openDate = setMinutes(
    setHours(
      utcToZonedTime(new Date(targetDate), "America/New_York"),
      openTimeHours
    ),
    openTimeMinutes
  );

  const closeDate = setMinutes(
    setHours(
      utcToZonedTime(new Date(targetDate), "America/New_York"),
      closeTimeHours
    ),
    closeTimeMinutes
  );

  return [openDate, closeDate];
};

export const isOpen = (
  restaurant: Restaurant,
  targetDate = new Date()
): boolean => {
  const [openDate, closeDate] = openAndCloseDates(restaurant, targetDate);

  if (!openDate || !closeDate) {
    return false;
  }

  if (isBefore(openDate, targetDate) && isAfter(closeDate, targetDate)) {
    return true;
  } else {
    return false;
  }
};
