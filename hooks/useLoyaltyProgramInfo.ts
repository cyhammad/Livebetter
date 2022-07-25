import { useQuery } from "@tanstack/react-query";

import { useCartContext } from "hooks/useCartContext";
import { useUserContext } from "hooks/useUserContext";
import { fetchUserWithLoyaltyProgram } from "lib/client/fetchUserWithLoyaltyProgram";
import { getNormalizedPhoneNumber } from "lib/getNormalizedPhoneNumber";

export const useLoyaltyProgramInfo = () => {
  const { phoneNumber } = useUserContext();
  const { cart } = useCartContext();

  return useQuery(
    ["loyalty-program-info", phoneNumber, cart?.restaurant.Restaurant ?? ""],
    () =>
      fetchUserWithLoyaltyProgram({
        phoneNumber: getNormalizedPhoneNumber(phoneNumber),
        restaurantName: cart?.restaurant.Restaurant ?? "",
      })
  );
};
