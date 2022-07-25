import type { Timestamp } from "firebase/firestore";

export interface UserWithLoyaltyProgram {
  created_at: Timestamp;
  phoneNumber: string;
  points: number;
  restaurantName: string;
}

export interface ApiUserWithLoyaltyProgram {
  created_at: string;
  phoneNumber: string;
  points: number;
  restaurantName: string;
}
