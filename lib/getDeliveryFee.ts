export const getDeliveryFee = (distance: number): number => {
  if (distance <= 0.5) {
    return 1.99;
  }

  if (distance <= 1) {
    return 2.99;
  }

  if (distance <= 3) {
    return 3.99;
  }

  if (distance <= 3.5) {
    return 4.99;
  }

  return 5.99;
};
