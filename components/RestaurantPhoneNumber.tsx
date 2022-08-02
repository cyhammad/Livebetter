import { Phone } from "phosphor-react";

import { getFormattedPhoneNumber } from "lib/getFormattedPhoneNumber";
import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
import type { ApiRestaurant } from "types";

interface RestaurantPhoneNumberProps {
  restaurant: ApiRestaurant;
}

export const RestaurantPhoneNumber = ({
  restaurant,
}: RestaurantPhoneNumberProps) => {
  const digits = getTenDigitPhoneNumber(restaurant.Phone);
  const isPhoneVisible = digits.length === 10;

  if (!isPhoneVisible) {
    return null;
  }

  const phoneFormatted = getFormattedPhoneNumber(digits);

  return (
    <div className="flex gap-2 items-center">
      <Phone
        className="flex-none w-[16px] sm:w-[20px] text-black"
        size={20}
        color="currentColor"
      />
      <a
        href={`tel:${phoneFormatted}`}
        className="text-sm sm:text-base underline underline-offset-4"
      >
        <span itemProp="telephone">{phoneFormatted}</span>
      </a>
    </div>
  );
};
