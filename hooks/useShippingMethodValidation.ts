import { useEffect, useMemo, useState } from "react";

import { useUserContext } from "hooks/useUserContext";
import { MAX_DELIVERY_RANGE } from "lib/constants";
import { notNullOrUndefined } from "lib/notNullOrUndefined";
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
  ].filter(notNullOrUndefined);

  const { getDistanceToCoordinates, location } = useUserContext();
  const [shouldShowShippingMethodOptions, setShouldShowShippingMethodOptions] =
    useState(
      !shippingMethod || !allowedShippingMethods.includes(shippingMethod)
    );

  useEffect(() => {
    setShouldShowShippingMethodOptions(
      !shippingMethod || !allowedShippingMethods.includes(shippingMethod)
    );
  }, [allowedShippingMethods, shippingMethod]);

  const [
    isShippingMethodValid,
    shippingMethodValidationMessage,
    distanceFromCustomer,
  ]: [boolean, string | null, number] = useMemo(() => {
    if (!shippingMethod || !Latitude || !Longitude) {
      return [false, null, 1];
    }

    const distance =
      getDistanceToCoordinates({
        latitude: parseFloat(Latitude),
        longitude: parseFloat(Longitude),
      }) ?? 1;

    if (shippingMethod === "delivery") {
      if (distance === null) {
        return [false, "Please enter your delivery address.", 1];
      }

      const isPennsylvaniaAddress =
        location?.address.includes(" PA ") &&
        !location?.address.includes(" NJ ");

      if (!isPennsylvaniaAddress) {
        return [
          false,
          "Currently, we can only deliver within Pennsylvania.",
          distance,
        ];
      }

      const isDeliveryWithinRange = !!(
        typeof distance === "number" && distance <= MAX_DELIVERY_RANGE
      );

      if (!isDeliveryWithinRange) {
        return [
          false,
          "Your location is outside of our delivery range for this restaurant.",
          distance,
        ];
      }
    }

    return [true, null, distance];
  }, [
    getDistanceToCoordinates,
    Latitude,
    Longitude,
    shippingMethod,
    location?.address,
  ]);

  return {
    allowedShippingMethods,
    distanceFromCustomer,
    isShippingMethodValid,
    setShouldShowShippingMethodOptions,
    shippingMethodValidationMessage,
    shouldShowShippingMethodOptions,
  };
};
