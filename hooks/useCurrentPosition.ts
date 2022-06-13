import { useEffect, useState } from "react";

import type { Coordinates } from "types";

export const useCurrentPosition = (shouldQueryLocation: boolean) => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!shouldQueryLocation) {
      return;
    }

    const geo = navigator.geolocation;

    if (!geo) {
      setError("Geolocation is not supported");

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
  }, [shouldQueryLocation]);

  return { ...position, error, isLoading };
};
