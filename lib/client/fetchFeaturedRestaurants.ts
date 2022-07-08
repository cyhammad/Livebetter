import { request } from "lib/client/request";
import type { GetFeaturedApiRestaurants } from "types";

export const fetchFeaturedRestaurants: GetFeaturedApiRestaurants = async (
  options
) => {
  const { sectionKeys, sortByDistanceFrom } = options || {};

  const searchParams = new URLSearchParams();

  if (sortByDistanceFrom) {
    const { latitude, longitude } = sortByDistanceFrom;

    searchParams.set("latitude", `${latitude}`);
    searchParams.set("longitude", `${longitude}`);
  }

  if (sectionKeys && sectionKeys.length > 0) {
    searchParams.set("section_keys", sectionKeys.join(","));
  }

  return await request(`/api/featured-restaurants?${searchParams.toString()}`, {
    method: "GET",
  });
};
