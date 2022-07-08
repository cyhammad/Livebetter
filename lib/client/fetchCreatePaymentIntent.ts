import { request } from "lib/client/request";
import type { GetCreatePaymentIntent } from "types";

export const fetchCreatePaymentIntent: GetCreatePaymentIntent = async (
  cart
) => {
  return await request("/api/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });
};
