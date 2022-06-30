import { useEffect, useState } from "react";

import type { Coordinates } from "types";

/**
 * Uses navigator.geolocation.watchPosition to update the returned `position`
 * property continuously as the user's position changes
 */
export const useWatchPosition = (shouldQueryLocation: boolean) => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const successCallback: PositionCallback = ({ coords }) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };

  const errorCallback: PositionErrorCallback = (positionError) => {
    setError(positionError.message);
    alert(positionError.message);
  };

  useEffect(() => {
    let watcher = 0;
    const geo = navigator.geolocation;

    if (shouldQueryLocation) {
      if (!geo) {
        setError("Geolocation is not supported");

        return;
      }

      watcher = geo.watchPosition(successCallback, errorCallback);
    }

    return () => geo.clearWatch(watcher);
  }, [shouldQueryLocation]);

  return { ...position, error };
};
