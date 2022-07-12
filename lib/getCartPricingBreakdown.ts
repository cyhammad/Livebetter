import { getCartItemsSubtotal } from "lib/getCartItemsSubtotal";
import { toMoney } from "lib/toMoney";
import type { CartMenuItem, ShippingMethod } from "types";

export const getCartPricingBreakdown = (
  items?: CartMenuItem[],
  shippingMethod?: ShippingMethod,
  tip = 0
) => {
  const subtotal = getCartItemsSubtotal(items);
  const tax = toMoney(subtotal * 0.08);
  const deliveryFee = shippingMethod === "delivery" ? 3.99 : 0;
  const processingFee = shippingMethod === "pickup" ? 2 : 0;
  const serviceFee =
    shippingMethod === "delivery" ? toMoney(subtotal * 0.19) : 0;
  const smallOrderFee =
    shippingMethod === "delivery" && subtotal < 20 ? 2.99 : 0;
  const total = toMoney(
    subtotal +
      tax +
      tip +
      deliveryFee +
      processingFee +
      serviceFee +
      smallOrderFee
  );

  return {
    amount: toMoney(total * 100),
    deliveryFee,
    processingFee,
    serviceFee,
    smallOrderFee,
    subtotal,
    tax,
    tip,
    total,
  };
};
