import { useState, useEffect } from "react";

import type { Coordinates } from "types";

export const useCurrentPosition = (shouldQueryLocation: boolean) => {
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

    geo.getCurrentPosition(onChange, onError, { enableHighAccuracy: true });
  }, [shouldQueryLocation]);

  return { ...position, error };
};
