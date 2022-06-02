import format from "date-fns/format";
import { openAndCloseDates } from "lib/isOpen";
import type { Restaurant } from "types";
import utcToZonedTime from "date-fns-tz/esm/utcToZonedTime";

type OpeningHoursStatus =
  | "open-now"
  | "open-later"
  | "closed-earlier"
  | "closed-today"
  | "closes-after-midnight";

export const getOpeningHoursInfo = (
  restaurant: Restaurant,
  targetDate = utcToZonedTime(new Date(), "America/New_York")
): {
  label: string;
  status: OpeningHoursStatus;
  openDate: Date | null;
  closeDate: Date | null;
} => {
  const [openDate, closeDate] = openAndCloseDates(restaurant, targetDate);

  if (openDate) {
    if (targetDate < openDate) {
      return {
        openDate,
        closeDate,
        status: "open-later",
        label: `Opens at ${format(openDate, "p")}`,
      };
    }
    if (!closeDate) {
      return {
        openDate,
        closeDate,
        status: "closes-after-midnight",
        label: "Open until after midnight",
      };
    }
  }

  if (closeDate) {
    if (targetDate >= closeDate) {
      return {
        openDate,
        closeDate,
        status: "closed-earlier",
        label: `Closed at ${format(closeDate, "p")}`,
      };
    }
    if (targetDate < closeDate) {
      return {
        openDate,
        closeDate,
        status: "open-now",
        label: `Open until ${format(closeDate, "p")}`,
      };
    }
  }

  return {
    openDate,
    closeDate,
    status: "closed-today",
    label: "Closed all day today",
  };
};
