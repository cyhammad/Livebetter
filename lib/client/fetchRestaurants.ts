import { request } from "lib/client/request";
import type { GetApiRestaurants } from "types";

export const fetchRestaurants: GetApiRestaurants = async (options) => {
  const {
    cuisines,
    limit = 20,
    offset = 0,
    search,
    sortByDistanceFrom,
  } = options || {};

  const searchParams = new URLSearchParams();

  searchParams.set("limit", `${limit}`);
  searchParams.set("offset", `${offset}`);

  if (sortByDistanceFrom) {
    const { latitude, longitude } = sortByDistanceFrom;

    searchParams.set("latitude", `${latitude}`);
    searchParams.set("longitude", `${longitude}`);
  }

  if (search) {
    searchParams.set("search", search);
  }

  if (cuisines && cuisines.length > 0) {
    searchParams.set("cuisines", cuisines.join(","));
  }

  return await request(`/api/restaurants?${searchParams.toString()}`, {
    method: "GET",
  });
};
