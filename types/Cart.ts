import type { ApiMenuItemChoice, ApiRestaurant, Location } from "types";

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
  mealPrice: number;
  name: string;
  notes: string;
  optionalChoices?: CartMenuItemChoices;
}

export type ShippingMethod = "delivery" | "pickup";

export type DeliveryDropOffPreference = "Leave it at my door" | "Hand it to me";

export interface Cart {
  items: CartMenuItem[];
  restaurant: ApiRestaurant;
  tip: number;
}

export interface CreatePaymentIntentCart extends Omit<Cart, "restaurant"> {
  restaurantName: string;
}

export interface CreatePaymentIntentUser {
  location?: Location;
  apartmentNumber: string;
  deliveryDropOffPreference: DeliveryDropOffPreference;
  deliveryDropOffNote: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  shippingMethod: ShippingMethod;
}
