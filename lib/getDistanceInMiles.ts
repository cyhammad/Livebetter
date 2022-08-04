import haversineDistance from "haversine-distance";

import { roundToTwoDecimals } from "lib/roundToTwoDecimals";
import type { Coordinates } from "types";

const METERS_TO_MILES_DIVISOR = 1609.344;

export const getDistanceInMiles = (
  coordsFrom: Coordinates,
  coordsTo: Coordinates
) => {
  return roundToTwoDecimals(
    haversineDistance(coordsFrom, coordsTo) / METERS_TO_MILES_DIVISOR
  );
};
