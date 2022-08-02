/**
 * Takes a phone number string, and returns a string that is 10 digits with all
 * non-numbers removed
 */
export const getTenDigitPhoneNumber = (phoneNumber?: string): string => {
  if (!phoneNumber) {
    return "";
  }

  let normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");

  if (normalizedPhoneNumber.startsWith("1")) {
    normalizedPhoneNumber = normalizedPhoneNumber.slice(1);
  }

  return normalizedPhoneNumber;
};
