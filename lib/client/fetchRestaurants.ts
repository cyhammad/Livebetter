import { request } from "lib/request";
import type { GetApiRestaurants } from "types";

export const fetchRestaurants: GetApiRestaurants = async (options) => {
  const {
    cuisines,
    limit = 20,
    offset = 0,
    search,
    sortByDistanceFrom,
  } = options || {};

  const restaurantsUrl = new URL(
    "/api/restaurants",
    process.env.NEXT_PUBLIC_BASE_URL
  );

  restaurantsUrl.searchParams.set("limit", `${limit}`);
  restaurantsUrl.searchParams.set("offset", `${offset}`);

  if (sortByDistanceFrom) {
    const { latitude, longitude } = sortByDistanceFrom;

    restaurantsUrl.searchParams.set("latitude", `${latitude}`);
    restaurantsUrl.searchParams.set("longitude", `${longitude}`);
  }

  if (search) {
    restaurantsUrl.searchParams.set("search", search);
  }

  if (cuisines && cuisines.length > 0) {
    restaurantsUrl.searchParams.set("cuisines", cuisines.join(","));
  }

  return await request(restaurantsUrl.toString(), {
    method: "GET",
  });
};
