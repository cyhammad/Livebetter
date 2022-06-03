import { ApiRestaurant, Coordinates } from "types";

interface GetApiRestaurantsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sortByDistanceFrom?: Coordinates;
  cuisines?: string[];
}

export interface GetApiRestaurantsResult {
  restaurants: ApiRestaurant[];
  cuisines: string[];
}

export type GetApiRestaurants = (
  options?: GetApiRestaurantsOptions
) => Promise<GetApiRestaurantsResult>;

export type FetchApiRestaurantsQueryKey = [
  "restaurants",
  number,
  number,
  Coordinates | null,
  string,
  string[]
];
