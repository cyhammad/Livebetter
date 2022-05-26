import type { NextApiRequest, NextApiResponse } from "next";

import { getApiRestaurants } from "lib/server/getApiRestaurants";
import type { ApiRestaurant } from "types";

type Data = {
  restaurants: ApiRestaurant[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
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

  const { restaurants } = await getApiRestaurants({
    limit,
    offset,
    search,
    sortByDistanceFrom:
      latitude && longitude ? { latitude, longitude } : undefined,
  });

  res.status(200).json({ restaurants });
}
