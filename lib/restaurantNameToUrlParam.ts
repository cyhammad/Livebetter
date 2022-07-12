export const restaurantNameToUrlParam = (restaurantName: string): string => {
  return encodeURIComponent(restaurantName.toLowerCase());
};

export const legacyRestaurantNameToUrlParam = (
  restaurantName: string
): string => {
  return restaurantName.toLowerCase();
};
