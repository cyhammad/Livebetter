import utcToZonedTime from "date-fns-tz/esm/utcToZonedTime";

import type { FeaturedSection } from "types";

export const getSectionKeys = (): FeaturedSection[] => {
  const now = utcToZonedTime(new Date(), "America/New_York");
  const hours = now.getHours();
  const day = now.getDay();

  const sectionKeys: FeaturedSection[] = ["tracking"];

  // 6 = Saturday, 0 = Sunday
  if ((day === 6 || day === 0) && hours >= 4 && hours <= 12 + 2) {
    sectionKeys.push("brunch");
  }

  if (hours >= 4 && hours <= 10) {
    sectionKeys.push("breakfast");
  } else if (hours >= 11 && hours <= 12 + 3) {
    sectionKeys.push("lunch");
  } else if (hours >= 12 + 4 && hours <= 12 + 9) {
    sectionKeys.push("dinner");
  } else if (hours >= 12 + 10 || hours <= 3) {
    sectionKeys.push("late_night");
  }

  sectionKeys.push("city_favorites");

  return sectionKeys;
};
