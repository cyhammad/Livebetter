export const amountToDollars = (amount: number): string => {
  return "$" + (Math.floor(amount * 100) / 100).toFixed(2);
};
