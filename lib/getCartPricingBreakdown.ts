import { getCartItemsSubtotal } from "lib/getCartItemsSubtotal";
import { roundToTwoDecimals } from "lib/roundToTwoDecimals";
import type { CartMenuItem, ShippingMethod } from "types";

const getDeliveryFee = (distance: number): number => {
  if (distance <= 0.5) {
    return 1.99;
  }

  if (distance <= 1) {
    return 2.99;
  }

  if (distance <= 3) {
    return 3.99;
  }

  if (distance <= 3.5) {
    return 4.99;
  }

  return 5.99;
};

/**
 * Do not subtract `discount` from `subtotal` before passing `subtotal` to this
 * function, because this function will do the subtraction for you.
 */
export const getCartFees = (
  subtotal: number,
  shippingMethod: ShippingMethod = "delivery",
  distance = 1,
  discount = 0
) => {
  const tax = roundToTwoDecimals((subtotal - discount) * 0.08);
  const deliveryFee =
    shippingMethod === "delivery" ? getDeliveryFee(distance) : 0;
  const processingFee = shippingMethod === "pickup" ? 2 : 0;
  const serviceFee =
    shippingMethod === "delivery" ? roundToTwoDecimals(subtotal * 0.19) : 0;
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

/**
 * Do not subtract `discount` from `subtotal` before passing `subtotal` to this
 * function, because this function will do the subtraction for you.
 */
export const getTotal = (
  subtotal: number,
  discount: number,
  tax: number,
  tip: number,
  deliveryFee: number,
  processingFee: number,
  serviceFee: number,
  smallOrderFee: number
): number => {
  return roundToTwoDecimals(
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

interface GetCartPricingBreakdownOptions {
  subtotal?: number;
  items?: CartMenuItem[];
  shippingMethod?: ShippingMethod;
  tip?: number;
  distance: number;
  discount?: number;
}

export const getCartPricingBreakdown = ({
  items,
  shippingMethod,
  subtotal,
  tip = 0,
  distance,
  discount = 0,
}: GetCartPricingBreakdownOptions) => {
  // NOTE: Always run any mathematical calculations through `roundToTwoDecimals` to prevent
  // JS math issues. (Try `16 + 2.99` in the console. You will see `18.990000000000002`)

  subtotal = subtotal ?? getCartItemsSubtotal(items);
  const { tax, deliveryFee, processingFee, serviceFee, smallOrderFee } =
    getCartFees(subtotal, shippingMethod, distance, discount);
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
    amount: roundToTwoDecimals(total * 100),
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
