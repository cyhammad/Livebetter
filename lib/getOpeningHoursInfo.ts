import { openAndCloseDates } from "lib/isOpen";
import type { Restaurant } from "types";

type OpeningHoursStatus =
  | "open-now"
  | "open-later"
  | "closed-earlier"
  | "closed-today"
  | "closes-after-midnight";

export const getOpeningHoursInfo = (
  restaurant: Restaurant,
  targetDate = new Date()
): {
  status: OpeningHoursStatus;
  openDate: Date | null;
  closeDate: Date | null;
} => {
  const [openDate, closeDate] = openAndCloseDates(restaurant, targetDate);

  if (openDate) {
    if (targetDate < openDate) {
      return { openDate, closeDate, status: "open-later" };
    }
    if (!closeDate) {
      return { openDate, closeDate, status: "closes-after-midnight" };
    }
  }

  if (closeDate) {
    if (targetDate >= closeDate) {
      return { openDate, closeDate, status: "closed-earlier" };
    }
    if (targetDate < closeDate) {
      return { openDate, closeDate, status: "open-now" };
    }
  }

  return { openDate, closeDate, status: "closed-today" };
};
