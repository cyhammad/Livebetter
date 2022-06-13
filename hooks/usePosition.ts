import { useEffect, useState } from "react";

import type { Coordinates } from "types";

export const usePosition = (shouldQueryLocation: boolean) => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange: PositionCallback = ({ coords }) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };
  const onError: PositionErrorCallback = (error) => {
    setError(error.message);
    alert(error.message);
  };

  useEffect(() => {
    if (!shouldQueryLocation) {
      return;
    }

    const geo = navigator.geolocation;

    if (!geo) {
      setError("Geolocation is not supported");
      return;
    }

    const watcher = geo.watchPosition(onChange, onError);

    return () => geo.clearWatch(watcher);
  }, [shouldQueryLocation]);

  return { ...position, error };
};
