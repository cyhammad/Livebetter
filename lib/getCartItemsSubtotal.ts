import { getCartMenuItemTotal } from "lib/getCartMenuItemTotal";
import type { CartMenuItem } from "types";

export const getCartItemsSubtotal = (items?: CartMenuItem[]) => {
  return (
    items?.reduce(
      (acc, { count, mealPrice, choices, optionalChoices }) =>
        acc + getCartMenuItemTotal(mealPrice, count, choices, optionalChoices),
      0
    ) ?? 0
  );
};
