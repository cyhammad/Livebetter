import { Timestamp } from "firebase/firestore";

import { getCartMenuItemTotal } from "lib/getCartMenuItemTotal";
import type {
  CreatePaymentIntentCart,
  CreatePaymentIntentUser,
  Order,
  OrderItem,
} from "types";

interface CreateOrderOptions {
  cart: CreatePaymentIntentCart;
  customerId: string;
  deliveryFee: number;
  discount: number;
  processingFee: number;
  serviceFee: number;
  smallOrderFee: number;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  user: CreatePaymentIntentUser;
}

export const createOrder = ({
  cart,
  customerId,
  deliveryFee,
  discount,
  processingFee,
  serviceFee,
  smallOrderFee,
  subtotal,
  tax,
  tip,
  total,
  user,
}: CreateOrderOptions): Order => {
  const deliver_to: Order["deliver_to"] =
    user.shippingMethod === "pickup"
      ? {
          address: "PICKUP ORDER",
          appartmentNo: "PICKUP ORDER",
          dropoff: "PICKUP ORDER",
          dropoff_note: "",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
        }
      : {
          address: user.location?.address ?? "Unknown",
          appartmentNo: user.apartmentNumber,
          customerLocation: user.location
            ? {
                lat: user.location.latitude,
                lng: user.location.longitude,
              }
            : undefined,
          dropoff_note: user.deliveryDropOffNote,
          dropoff: user.deliveryDropOffPreference,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
        };

  return {
    charges_id: "",
    created_at: Timestamp.now(),
    customers_id: customerId,
    deliver_to,
    deliveryFee,
    processingFee,
    serviceFee,
    tax,
    smallOrderFee,
    discount,
    distance: cart.distance,
    order_items: cart.items.map(
      ({
        choices,
        count,
        mealPrice,
        name,
        notes,
        optionalChoices,
      }): OrderItem => {
        const menuItemTotal = getCartMenuItemTotal(
          mealPrice,
          count,
          choices,
          optionalChoices
        );

        return {
          choices: Object.entries(choices ?? {})?.flatMap(
            ([, categoryChoices]) =>
              categoryChoices.map(
                ({ count: choiceCount, name: choiceName, price }) => ({
                  qty: choiceCount,
                  name: choiceName,
                  price,
                })
              )
          ),
          item_description: notes,
          item_id: name,
          item_price: mealPrice,
          item_total: menuItemTotal.toFixed(2),
          optionsTotal: menuItemTotal - mealPrice,
          optionalChoices: Object.entries(optionalChoices ?? {})?.flatMap(
            ([, categoryChoices]) =>
              categoryChoices.map(
                ({ count: choiceCount, name: choiceName, price }) => ({
                  qty: choiceCount,
                  name: choiceName,
                  price,
                })
              )
          ),
          qty: count,
        };
      }
    ),
    restaurant_id: cart.restaurantName,
    subTotal: subtotal,
    tip,
    total,
  };
};
