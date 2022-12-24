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
  waitTime?: number;

  // loyalty program properties
  loyaltyProgramAvailable?: boolean;
  threshold?: number;
  discountAmount?: number;
  discountUpon?: number;
}

export type Day =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type RestaurantOpenHours = Record<string, string>;
export type ApiRestaurantOpenHours = Record<
  Day,
  { openTime: [number, number]; closeTime: [number, number] } | null
>;

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

  /**
   * @deprecated Use `openHours`
   */
  OpenHours?: string;

  openHours?: ApiRestaurantOpenHours;

  Shipday?: boolean;
}
