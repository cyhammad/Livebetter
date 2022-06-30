import type { FeaturedSection } from "types";

export interface Restaurant {
  Address: string;
  Cuisine?: string;
  Image?: string;
  Latitude: string;
  Longitude: string;
  MapPin?: string;
  OpenDays?: string;
  OpenHours?: string;
  Phone?: string;
  Restaurant: string;
  Website?: string;
  Items?: string;
  isDeliveryAvailable?: boolean;
  isPickUpAvailable?: boolean;
  Tracking?: number;
  featured_in?: FeaturedSection[];
}

export type RestaurantOpenHours = Record<string, string>;

export interface ApiRestaurant extends Restaurant {
  cuisines?: string[];
  /**
   * @deprecated Use `cuisines`
   */
  Cuisine?: string;
  /**
   * Distance in miles
   */
  distance?: number;
}
