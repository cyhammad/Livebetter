import { useQuery } from "@tanstack/react-query";

import { useCartContext } from "hooks/useCartContext";
import { useUserContext } from "hooks/useUserContext";
import { fetchUserWithLoyaltyProgram } from "lib/client/fetchUserWithLoyaltyProgram";
import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";

export const useLoyaltyProgramInfo = () => {
  const { phoneNumber } = useUserContext();
  const { cart } = useCartContext();

  const isLoyaltyProgramInfoQueryEnabled =
    getTenDigitPhoneNumber(phoneNumber).length === 10 &&
    !!cart?.restaurant.Restaurant;

  return useQuery(
    ["loyalty-program-info", phoneNumber, cart?.restaurant.Restaurant ?? ""],
    () =>
      fetchUserWithLoyaltyProgram({
        phoneNumber: getTenDigitPhoneNumber(phoneNumber),
        restaurantName: cart?.restaurant.Restaurant ?? "",
      }),
    { enabled: isLoyaltyProgramInfoQueryEnabled }
  );
};
