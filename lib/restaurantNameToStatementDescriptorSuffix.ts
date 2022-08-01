export const restaurantNameToStatementDescriptorSuffix = (
  restaurantName: string
) => {
  return restaurantName
    .replace(/[^0-9a-zA-Z ]/g, "")
    .slice(0, 12)
    .trim();
};
