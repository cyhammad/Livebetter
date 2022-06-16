import { request } from "lib/request";
import type { GetFeaturedApiRestaurants } from "types";

export const fetchFeaturedRestaurants: GetFeaturedApiRestaurants = async (
  options
) => {
  const {
    sectionKeys,
    limit = 20,
    offset = 0,
    sortByDistanceFrom,
  } = options || {};

  const restaurantsUrl = new URL(
    "/api/featured-restaurants",
    process.env.NEXT_PUBLIC_BASE_URL
  );

  restaurantsUrl.searchParams.set("limit", `${limit}`);
  restaurantsUrl.searchParams.set("offset", `${offset}`);

  if (sortByDistanceFrom) {
    const { latitude, longitude } = sortByDistanceFrom;

    restaurantsUrl.searchParams.set("latitude", `${latitude}`);
    restaurantsUrl.searchParams.set("longitude", `${longitude}`);
  }

  if (sectionKeys && sectionKeys.length > 0) {
    restaurantsUrl.searchParams.set("section_keys", sectionKeys.join(","));
  }

  return await request(restaurantsUrl.toString(), {
    method: "GET",
  });
};
