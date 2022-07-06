import { withSentry } from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

import { getApiRestaurants } from "lib/server/getApiRestaurants";
import type { GetApiRestaurantsResult } from "types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetApiRestaurantsResult>
) {
  const limit =
    typeof req.query.limit === "string" && !isNaN(parseInt(req.query.limit))
      ? parseInt(req.query.limit)
      : undefined;
  const offset =
    typeof req.query.offset === "string" && !isNaN(parseInt(req.query.offset))
      ? parseInt(req.query.offset)
      : undefined;
  const latitude =
    typeof req.query.latitude === "string" &&
    !isNaN(parseFloat(req.query.latitude))
      ? parseFloat(req.query.latitude)
      : undefined;
  const longitude =
    typeof req.query.longitude === "string" &&
    !isNaN(parseFloat(req.query.longitude))
      ? parseFloat(req.query.longitude)
      : undefined;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const cuisinesParam =
    typeof req.query.cuisines === "string" && req.query.cuisines.length > 0
      ? req.query.cuisines.split(",")
      : undefined;

  const result = await getApiRestaurants({
    limit,
    offset,
    search,
    sortByDistanceFrom:
      latitude && longitude ? { latitude, longitude } : undefined,
    cuisines: cuisinesParam,
  });

  res.status(200).json(result);
}

export default withSentry(handler);
