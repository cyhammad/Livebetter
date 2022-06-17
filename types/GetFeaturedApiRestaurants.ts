import { ApiRestaurant, Coordinates } from "types";

export type FeaturedSection =
  | "breakfast"
  | "brunch"
  | "city_favorites"
  | "dinner"
  | "late_night"
  | "lunch"
  | "staff_picks"
  | "tracking";

interface GetFeaturedApiRestaurantsOptions {
  sectionKeys: FeaturedSection[];
  sortByDistanceFrom?: Coordinates;
}

export interface GetFeaturedApiRestaurantsResult {
  sections: Record<FeaturedSection, ApiRestaurant[]>;
}

export type GetFeaturedApiRestaurants = (
  options?: GetFeaturedApiRestaurantsOptions
) => Promise<GetFeaturedApiRestaurantsResult>;

export type FetchFeaturedApiRestaurantsQueryKey = [
  "featured_restaurants",
  FeaturedSection[],
  Coordinates | null
];
