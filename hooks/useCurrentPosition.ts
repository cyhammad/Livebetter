import { useEffect, useRef, useState } from "react";

import { useInputPlacesAutocompleteContext } from "hooks/useInputPlacesAutocompleteContext";
import type { Coordinates } from "types";

/**
 * Uses navigator.geolocation.getCurrentPosition to retrieve the returned
 * `position`. The position is only retrieved when the `shouldQueryLocation`
 * parameter is, or changes to, `true`
 */
export const useCurrentPosition = (
  shouldQueryLocationParam: boolean | "InputPlacesAutocompleteContext"
) => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { shouldQueryLocation: shouldQueryLocationFromContext } =
    useInputPlacesAutocompleteContext();

  const shouldQueryLocation =
    shouldQueryLocationParam === "InputPlacesAutocompleteContext"
      ? shouldQueryLocationFromContext
      : shouldQueryLocationParam;

  const prevShouldQueryLocationRef = useRef<boolean>(shouldQueryLocation);

  useEffect(() => {
    // Exit if `shouldQueryLocation` is false, or if did not change from false
    // to true (this hook will run when `shouldQueryLocation` changes, _and_
    // when `useCurrentPosition` is mounted)
    if (
      !shouldQueryLocation ||
      prevShouldQueryLocationRef.current === shouldQueryLocation
    ) {
      prevShouldQueryLocationRef.current = shouldQueryLocation;

      return;
    }

    const geo = navigator.geolocation;

    if (!geo) {
      setError("Geolocation is not supported");
      prevShouldQueryLocationRef.current = shouldQueryLocation;

      return;
    }

    setIsLoading(true);

    const successCallback: PositionCallback = ({ coords }) => {
      setPosition({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setError(null);
      setIsLoading(false);
    };

    const errorCallback: PositionErrorCallback = (positionError) => {
      setError(positionError.message);
      setIsLoading(false);
      alert(positionError.message);
    };

    geo.getCurrentPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
    });

    prevShouldQueryLocationRef.current = shouldQueryLocation;
  }, [shouldQueryLocation]);

  return { ...position, error, isLoading };
};
