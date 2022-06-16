import type { NextApiRequest, NextApiResponse } from "next";

import { getFeaturedApiRestaurants } from "lib/server/getFeaturedApiRestaurants";
import type { FeaturedSection, GetFeaturedApiRestaurantsResult } from "types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetFeaturedApiRestaurantsResult>
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
  const sectionKeys = (
    typeof req.query.section_keys === "string" &&
    req.query.section_keys.length > 0
      ? req.query.section_keys.split(",")
      : []
  ) as FeaturedSection[];

  const result = await getFeaturedApiRestaurants({
    limit,
    offset,
    sectionKeys,
    sortByDistanceFrom:
      latitude && longitude ? { latitude, longitude } : undefined,
  });

  res.status(200).json(result);
}
