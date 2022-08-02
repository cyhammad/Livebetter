import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";

export const getFormattedPhoneNumber = (phoneNumber?: string): string => {
  const cleanPhone = getTenDigitPhoneNumber(phoneNumber);

  const [_, group1, group2, group3] =
    cleanPhone.match(/(\d{0,3})(\d{0,3})(\d{0,4})/) ?? [];

  let formattedPhone = "";

  if (group1) {
    formattedPhone = "(" + group1;
  }

  if (group2) {
    formattedPhone += ") " + group2;
  }

  if (group3) {
    formattedPhone += "-" + group3;
  }

  return formattedPhone;
};
