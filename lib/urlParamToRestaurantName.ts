export const urlParamToRestaurantName = (urlParam: string): string => {
  return decodeURIComponent(urlParam).toUpperCase();
};
