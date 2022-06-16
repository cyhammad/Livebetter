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

export interface MenuItem {
  category?: string;
  /**
   * An object that looks like:
   * {
   *   "Flavor)∞(Chocolate Chip Cookie": 0,
   *   "Flavor)∞(Vanilla speculoos": -786,
   * };
   */
  choices?: Record<string, number>;
  meal_Description?: string;
  meal_Price: number;
  outOfStock?: boolean;
  picture?: string;
  /**
   * The amount of `choices` the user can add
   */
  quantity?: number;
  /**
   * An object that looks like:
   * {
   *   "Flavor)∞(Chocolate Chip Cookie": 0,
   *   "Flavor)∞(Vanilla speculoos": -786,
   * };
   */
  optionalChoices?: Record<string, number>;
}

export interface ApiMenuItem {
  category: string | null;
  choices: Record<string, number> | null;
  mealDescription: string | null;
  mealPrice: number;
  name: string;
  optionalChoices: Record<string, number> | null;
  outOfStock: boolean;
  picture: string | null;
  quantity: number | null;
}
