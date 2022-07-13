import { getCartFees } from "lib/getCartPricingBreakdown";
import type { Order } from "types";

export const getOrderSms = (order: Order) => {
  const { deliveryFee, processingFee, serviceFee, smallOrderFee } = getCartFees(
    order.subTotal ?? 0,
    order.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery"
  );

  const profit =
    deliveryFee + processingFee + serviceFee + smallOrderFee + order.tip;

  return `NEW ORDER

Customer Name: ${order.deliver_to.firstName} ${order.deliver_to.lastName}
Customer Email: ${order.deliver_to.email}
Customer Mobile: ${order.deliver_to.phoneNumber}
Customer Address: ${order.deliver_to.address}
Restaurant Name: ${order.restaurant_id}
Apartment Number: ${
    order.deliver_to.appartmentNo ? order.deliver_to.appartmentNo : "N/A"
  }
Drop-off Note: ${
    order.deliver_to.dropoff_note === "" ? "N/A" : order.deliver_to.dropoff_note
  }
Drop-off Preference: ${order.deliver_to.dropoff}
Tip: $${order.tip}
Subtotal: $${order.subTotal}
Profit: $${profit}
Total Amount: $${order.total}`;
};
