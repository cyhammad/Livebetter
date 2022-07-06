import { useMemo } from "react";

import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";
import type { ApiRestaurant } from "types";

export const useRestaurantOrderValidation = (
  restaurant?: ApiRestaurant | null
) => {
  const { isDeliveryAvailable, isPickUpAvailable } = restaurant || {};
  const { isOpen: isRestaurantOpen } = restaurant
    ? getOpeningHoursInfo(restaurant)
    : { isOpen: false };

  const [isRestaurantOrderValid, restaurantOrderValidationMessage]: [
    boolean,
    string | null
  ] = useMemo(() => {
    if (!isDeliveryAvailable && !isPickUpAvailable) {
      return [
        false,
        "Pick-up and delivery are unavailable for this restaurant.",
      ];
    }

    if (!isRestaurantOpen) {
      return [false, "This restaurant is currently closed."];
    }

    return [true, null];
  }, [isDeliveryAvailable, isPickUpAvailable, isRestaurantOpen]);

  return { isRestaurantOrderValid, restaurantOrderValidationMessage };
};
