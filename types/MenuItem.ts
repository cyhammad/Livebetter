import type { ApiRestaurant, CartMenuItemChoices, ShippingMethod } from "types";

export interface MenuItem {
  addOnItems?: string[];
  allowNotes?: boolean;
  category?: string;
  /**
   * An object that looks like:
   * {
   *   "Flavor)∞(Chocolate Chip Cookie": 0,
   *   "Flavor)∞(Vanilla icing": -786,
   * };
   */
  choices?: Record<string, number>;
  isVegan?: boolean;
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

  popular?: boolean;
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
  /**
   * The ids of menu items that can be added to the cart with this menu item
   */
  addOnItems: string[] | null;
  allowNotes: boolean;
  category: string | null;
  choices: ApiMenuItemChoices | null;
  isPopular: boolean;
  isVegan: boolean;
  mealDescription: string | null;
  mealPrice: number;
  name: string;
  optionalChoices: ApiMenuItemChoices | null;
  outOfStock: boolean;
  picture: string | null;
  quantity: number | null;
}

export interface MenuItemData {
  menuItems: {
    choices?: CartMenuItemChoices | undefined;
    count: number;
    isVegan: boolean;
    category: string | null;
    name: string;
    menuItemNotes: string;
    mealPrice: number;
    optionalChoices?: CartMenuItemChoices | undefined;
  }[];
  restaurant: ApiRestaurant;
  shippingMethod: ShippingMethod;
  shouldVerifyContactInfo: boolean;
}
