import { CreatePaymentIntentCart, CreatePaymentIntentUser } from "types";

export interface GetCreatePaymentIntentResult {
  clientSecret: string | null;
}

export type GetCreatePaymentIntent = (
  cart: CreatePaymentIntentCart,
  user: CreatePaymentIntentUser
) => Promise<GetCreatePaymentIntentResult>;

export interface CreatePaymentIntentRequestBody {
  cart: CreatePaymentIntentCart;
  user: CreatePaymentIntentUser;
}
