import { CreatePaymentIntentCart } from "./Cart";

export interface GetCreatePaymentIntentResult {
  clientSecret: string | null;
}

export type GetCreatePaymentIntent = (
  cart: CreatePaymentIntentCart
) => Promise<GetCreatePaymentIntentResult>;
