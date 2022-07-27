import type { Timestamp } from "firebase/firestore";

import { Order } from "types";

export type PaymentIntentStatus =
  | null
  | "canceled"
  | "created"
  | "payment_failed"
  | "processing"
  | "succeeded";

export interface PaymentIntentOrder {
  didOptInToLoyaltyProgramWithThisOrder: boolean;
  order: Order;
  status?:
    | null
    | "canceled"
    | "created"
    | "payment_failed"
    | "processing"
    | "succeeded";
  updatedAt: Timestamp;
}
