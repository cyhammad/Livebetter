import utcToZonedTime from "date-fns-tz/esm/utcToZonedTime";

import type { ApiRestaurant, Day } from "types";

type OpeningHoursStatus =
  | "open-now"
  | "open-later"
  | "closed-earlier"
  | "closed-today"
  | "closes-after-midnight";

const days: Day[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getOpeningHoursInfo = (
  restaurant: ApiRestaurant,
  targetDate = utcToZonedTime(new Date(), "America/New_York")
): {
  status: OpeningHoursStatus;
  openDate: Date | null;
  closeDate: Date | null;
  isOpen: boolean;
} => {
  if (process.env.NODE_ENV === "development") {
    return {
      openDate: new Date(Date.now() - 10000),
      closeDate: new Date(Date.now() + 10000),
      status: "open-now",
      isOpen: true,
    };
  }

  const todayDayIndex = new Date().getDay();

  const { openDate: openJsonDate, closeDate: closeJsonDate } =
    restaurant.openHours?.[days[todayDayIndex]] ?? {};

  const openDate = openJsonDate
    ? utcToZonedTime(new Date(openJsonDate), "America/New_York")
    : null;
  const closeDate = closeJsonDate
    ? utcToZonedTime(new Date(closeJsonDate), "America/New_York")
    : null;

  if (openDate) {
    if (targetDate < openDate) {
      return {
        openDate,
        closeDate,
        status: "open-later",
        isOpen: false,
      };
    }

    if (!closeDate) {
      return {
        openDate,
        closeDate,
        status: "closes-after-midnight",
        isOpen: true,
      };
    }
  }

  if (closeDate) {
    if (targetDate >= closeDate) {
      return {
        openDate,
        closeDate,
        status: "closed-earlier",
        isOpen: false,
      };
    }

    if (targetDate < closeDate) {
      return {
        openDate,
        closeDate,
        status: "open-now",
        isOpen: true,
      };
    }
  }

  return {
    openDate,
    closeDate,
    status: "closed-today",
    isOpen: false,
  };
};
