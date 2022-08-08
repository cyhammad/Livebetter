import type { ApiMenuItemChoice, ApiRestaurant } from "types";

export interface CartMenuItemChoiceInput extends ApiMenuItemChoice {
  count: number | null;
}

export interface CartMenuItemChoice extends ApiMenuItemChoice {
  count: number;
}

export type CartMenuItemChoicesInput = Record<
  /**
   * The category name
   */
  string,
  Array<CartMenuItemChoiceInput>
>;

export type CartMenuItemChoices = Record<
  /**
   * The category name
   */
  string,
  Array<CartMenuItemChoice>
>;

export interface CartMenuItem {
  category: string | null;
  choices?: CartMenuItemChoices;
  /**
   * The number of this exact item that have been added
   */
  count: number;
  isVegan: boolean;
  mealPrice: number;
  name: string;
  notes: string;
  optionalChoices?: CartMenuItemChoices;
}

export type ShippingMethod = "delivery" | "pickup";

export type DeliveryDropOffPreference = "Leave it at my door" | "Hand it to me";

export interface Cart {
  didOptInToLoyaltyProgramWithThisOrder: boolean;
  distance: number;
  items: CartMenuItem[];
  restaurant: ApiRestaurant;
  tip: number;
  paymentIntentClientSecret: string | null;
}

export type CartFlowModalName = "cart" | "checkout" | "otp";
