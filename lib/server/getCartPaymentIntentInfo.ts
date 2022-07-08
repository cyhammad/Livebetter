import type { CreatePaymentIntentCart } from "types";

export const getCartPaymentIntentInfo = (
  _cartPaymentIntent: CreatePaymentIntentCart
): { amount: number } => {
  return { amount: 0 };
};
