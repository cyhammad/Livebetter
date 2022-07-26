import { getCartItemsSubtotal } from "lib/getCartItemsSubtotal";
import { toMoney } from "lib/toMoney";
import type { CartMenuItem, ShippingMethod } from "types";

export const getCartFees = (
  subtotal: number,
  shippingMethod?: ShippingMethod,
  discount = 0
) => {
  const tax = toMoney((subtotal - discount) * 0.08);
  const deliveryFee = shippingMethod === "delivery" ? 3.99 : 0;
  const processingFee = shippingMethod === "pickup" ? 2 : 0;
  const serviceFee =
    shippingMethod === "delivery" ? toMoney(subtotal * 0.19) : 0;
  const smallOrderFee =
    shippingMethod === "delivery" && subtotal < 20 ? 2.99 : 0;

  return {
    tax,
    deliveryFee,
    processingFee,
    serviceFee,
    smallOrderFee,
  };
};

export const getCartProfit = (
  subtotal: number,
  tip: number,
  shippingMethod?: ShippingMethod,
  discount = 0
) => {
  const { deliveryFee, processingFee, serviceFee, smallOrderFee, tax } =
    getCartFees(subtotal - discount, shippingMethod, discount);

  /**
   * Stripe's fee is currently 2.9% + 30 cents, per transaction
   */
  const stripeFee = toMoney(
    getTotal(
      subtotal,
      discount,
      tax,
      tip,
      deliveryFee,
      processingFee,
      serviceFee,
      smallOrderFee
    ) *
      0.029 +
      0.3
  );

  return (
    deliveryFee + processingFee + serviceFee + smallOrderFee + tip - stripeFee
  );
};

const getTotal = (
  subtotal: number,
  discount: number,
  tax: number,
  tip: number,
  deliveryFee: number,
  processingFee: number,
  serviceFee: number,
  smallOrderFee: number
): number => {
  return toMoney(
    subtotal -
      discount +
      tax +
      tip +
      deliveryFee +
      processingFee +
      serviceFee +
      smallOrderFee
  );
};

export const getCartPricingBreakdown = (
  items?: CartMenuItem[],
  shippingMethod?: ShippingMethod,
  tip = 0,
  discount = 0
) => {
  // NOTE: Always run any mathematical calculations through `toMoney` to prevent
  // JS math issues. (Try `16 + 2.99` in the console. You will see `18.990000000000002`)

  const subtotal = getCartItemsSubtotal(items);
  const { tax, deliveryFee, processingFee, serviceFee, smallOrderFee } =
    getCartFees(subtotal - discount, shippingMethod);
  const total = getTotal(
    subtotal,
    discount,
    tax,
    tip,
    deliveryFee,
    processingFee,
    serviceFee,
    smallOrderFee
  );

  return {
    amount: toMoney(total * 100),
    deliveryFee,
    discount,
    processingFee,
    serviceFee,
    smallOrderFee,
    subtotal,
    tax,
    tip,
    total,
  };
};
