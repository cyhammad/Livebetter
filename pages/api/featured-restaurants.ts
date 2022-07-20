import { captureException, flush, withSentry } from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { getFeaturedApiRestaurants } from "lib/server/getFeaturedApiRestaurants";
import type {
  ApiErrorResponse,
  FeaturedSection,
  GetFeaturedApiRestaurantsResult,
} from "types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetFeaturedApiRestaurantsResult | ApiErrorResponse>
) {
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
  const sectionKeys = (
    typeof req.query.section_keys === "string" &&
    req.query.section_keys.length > 0
      ? req.query.section_keys.split(",")
      : []
  ) as FeaturedSection[];

  try {
    const result = await getFeaturedApiRestaurants({
      sectionKeys,
      sortByDistanceFrom:
        latitude && longitude ? { latitude, longitude } : undefined,
    });

    res.status(200).json(result);
  } catch (err) {
    captureException(err);

    await flush(2000);

    res.status(500).json(createApiErrorResponse(err));
  }
}

export default withSentry(handler);
