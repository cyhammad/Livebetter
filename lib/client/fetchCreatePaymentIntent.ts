import { request } from "lib/client/request";
import type {
  CreatePaymentIntentRequestBody,
  GetCreatePaymentIntent,
} from "types";

export const fetchCreatePaymentIntent: GetCreatePaymentIntent = async (
  cart,
  user
) => {
  const body: CreatePaymentIntentRequestBody = {
    cart,
    user,
  };

  return await request("/api/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};
