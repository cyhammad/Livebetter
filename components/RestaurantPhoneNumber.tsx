import type { ApiRestaurant } from "types";
import { Phone } from "phosphor-react";

interface RestaurantPhoneNumberProps {
  restaurant: ApiRestaurant;
}

export const RestaurantPhoneNumber = ({
  restaurant,
}: RestaurantPhoneNumberProps) => {
  const digits = restaurant.Phone?.replace(/\D/g, "") ?? "";
  const isPhoneVisible =
    !!restaurant.Phone && (digits.length === 10 || digits.length === 11);

  if (!isPhoneVisible) {
    return null;
  }

  const phoneTenDigits = digits.length === 11 ? digits.slice(1) : digits;
  const phoneFormatted = [
    phoneTenDigits.slice(0, 3),
    phoneTenDigits.slice(3, 6),
    phoneTenDigits.slice(6),
  ].join("-");

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
        {phoneFormatted}
      </a>
    </div>
  );
};
