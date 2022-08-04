/**
 * Reliably rounds a number to 2 digits. Handles numbers like `1.255` which
 * would typically round to `1.25` with traditional methods.
 */
export const roundToTwoDecimals = (input: number) => {
  return Math.round((input + Number.EPSILON) * 100) / 100;
};
