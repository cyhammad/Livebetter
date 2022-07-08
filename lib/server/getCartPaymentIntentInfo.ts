import { getCartItemsSubtotal } from "lib/getCartItemsSubtotal";
import type { CreatePaymentIntentCart } from "types";

export const getCartPaymentIntentInfo = (
  cart: CreatePaymentIntentCart
): { amount: number } => {
  const subtotal = getCartItemsSubtotal(cart.items);

  return { amount: subtotal * 100 };
};
