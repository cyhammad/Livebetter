import {
  Cart,
  DeliveryDropOffPreference,
  ShippingMethod,
  UserLocation,
} from "types";

export interface CreatePaymentIntentCart extends Omit<Cart, "restaurant"> {
  restaurantName: string;
}

export interface CreatePaymentIntentUser {
  location?: UserLocation;
  apartmentNumber: string;
  deliveryDropOffPreference: DeliveryDropOffPreference;
  deliveryDropOffNote: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  shippingMethod: ShippingMethod;
}

export interface CreatePaymentIntentResult {
  clientSecret: string | null;
}

export type FetchCreatePaymentIntent = (
  cart: CreatePaymentIntentCart,
  user: CreatePaymentIntentUser
) => Promise<CreatePaymentIntentResult>;

export interface CreatePaymentIntentRequestBody {
  cart: CreatePaymentIntentCart;
  user: CreatePaymentIntentUser;
}
