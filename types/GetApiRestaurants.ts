import { ApiRestaurant, Coordinates } from "types";

interface GetApiRestaurantsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sortByDistanceFrom?: Coordinates;
  shouldIncludeClosed?: boolean;
}

interface GetApiRestaurantsResult {
  restaurants: ApiRestaurant[];
  cuisines: string[];
}

export type GetApiRestaurants = (
  options?: GetApiRestaurantsOptions
) => Promise<GetApiRestaurantsResult>;
