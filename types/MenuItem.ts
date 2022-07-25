import type { ApiRestaurant, CartMenuItemChoices, ShippingMethod } from "types";

export interface MenuItem {
  category?: string;
  /**
   * An object that looks like:
   * {
   *   "Flavor)∞(Chocolate Chip Cookie": 0,
   *   "Flavor)∞(Vanilla icing": -786,
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
   *   "Flavor)∞(Vanilla icing": -786,
   * };
   */
  optionalChoices?: Record<string, number>;
}

export interface ApiMenuItemChoice {
  name: string;
  price: number;
}

export type ApiMenuItemChoices = Record<
  /**
   * The category name
   */
  string,
  Array<ApiMenuItemChoice>
>;

export interface ApiMenuItem {
  category: string | null;
  choices: ApiMenuItemChoices | null;
  mealDescription: string | null;
  mealPrice: number;
  name: string;
  optionalChoices: ApiMenuItemChoices | null;
  outOfStock: boolean;
  picture: string | null;
  quantity: number | null;
}

export interface MenuItemData {
  choices?: CartMenuItemChoices | undefined;
  count: number;
  menuItemCategory: string | null;
  menuItemName: string;
  menuItemNotes: string;
  menuItemPrice: number;
  optionalChoices?: CartMenuItemChoices | undefined;
  restaurant: ApiRestaurant;
  shippingMethod: ShippingMethod;
  shouldVerifyContactInfo: boolean;
}
