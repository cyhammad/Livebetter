import { request } from "lib/client/request";
import type { ApiUserWithLoyaltyProgram } from "types";

interface FetchUserWithLoyaltyProgramOptions {
  phoneNumber: string;
  restaurantName: string;
}

export const fetchUserWithLoyaltyProgram = async (
  options: FetchUserWithLoyaltyProgramOptions
): Promise<{ user: ApiUserWithLoyaltyProgram | null }> => {
  const { phoneNumber, restaurantName } = options;

  const searchParams = new URLSearchParams();

  searchParams.set("phoneNumber", `${phoneNumber}`);
  searchParams.set("restaurantName", `${restaurantName}`);

  return await request(`/api/loyalty-program-info?${searchParams.toString()}`, {
    method: "GET",
  });
};
