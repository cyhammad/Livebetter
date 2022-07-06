import { useEffect, useMemo, useState } from "react";

import { useUserContext } from "hooks/useUserContext";
import { ApiRestaurant, ShippingMethod } from "types";

export const useShippingMethodValidation = (
  restaurant?: ApiRestaurant | null,
  shippingMethod?: ShippingMethod | null
) => {
  const { isDeliveryAvailable, isPickUpAvailable, Latitude, Longitude } =
    restaurant || {};
  const allowedShippingMethods = [
    isDeliveryAvailable ? "delivery" : null,
    isPickUpAvailable ? "pickup" : null,
  ].filter(Boolean);

  const { getDistanceToCoordinates } = useUserContext();
  const [shouldShowShippingMethodOptions, setShouldShowShippingMethodOptions] =
    useState(
      !shippingMethod || !allowedShippingMethods.includes(shippingMethod)
    );

  useEffect(() => {
    setShouldShowShippingMethodOptions(
      !shippingMethod || !allowedShippingMethods.includes(shippingMethod)
    );
  }, [allowedShippingMethods, shippingMethod]);

  const [isShippingMethodValid, shippingMethodValidationMessage]: [
    boolean,
    string | null
  ] = useMemo(() => {
    if (!shippingMethod || !Latitude || !Longitude) {
      return [
        false,
        null,
        // 'Please select either "Pickup" or "Delivery".'
      ];
    }

    const distanceFromCustomer = getDistanceToCoordinates({
      latitude: parseFloat(Latitude),
      longitude: parseFloat(Longitude),
    });

    if (shippingMethod === "delivery") {
      if (distanceFromCustomer === null) {
        return [false, "Please enter your delivery address."];
      }

      const isDeliveryWithinRange = !!(
        distanceFromCustomer && distanceFromCustomer <= 3
      );

      if (!isDeliveryWithinRange) {
        return [
          false,
          "Your location is outside of our delivery range for this restaurant.",
        ];
      }
    }

    return [true, null];
  }, [getDistanceToCoordinates, Latitude, Longitude, shippingMethod]);

  return {
    allowedShippingMethods,
    isShippingMethodValid,
    shippingMethodValidationMessage,
    shouldShowShippingMethodOptions,
    setShouldShowShippingMethodOptions,
  };
};
