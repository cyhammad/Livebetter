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
  createdAt: Timestamp;
  order: Order;
  paymentIntentId: string;
  status:
    | null
    | "canceled"
    | "created"
    | "payment_failed"
    | "processing"
    | "succeeded";
  updatedAt: Timestamp;
}
