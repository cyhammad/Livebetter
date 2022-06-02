import format from "date-fns/format";
import { getOpeningHoursInfo } from "./getOpeningHoursInfo";
import type { Restaurant } from "types";

export const getOpeningHoursLabel = (restaurant: Restaurant): string => {
  const { closeDate, openDate, status } = getOpeningHoursInfo(restaurant);

  switch (status) {
    case "closed-today":
      return "Closed today";
    case "open-later":
      if (openDate) {
        return `Opens at ${format(openDate, "p")}`;
      }
      break;
    case "closes-after-midnight":
      return `Open until after midnight`;
    case "closed-earlier":
      if (closeDate) {
        return `Closed at ${format(closeDate, "p")}`;
      }
      break;
    case "open-now":
      if (closeDate) {
        return `Open until ${format(closeDate, "p")}`;
      }
  }

  return "";
};
