import { ApiMenuItem, MenuItem } from "types";

export const toApiMenuItem = (
  name: string,
  {
    category,
    choices,
    meal_Description,
    meal_Price,
    outOfStock,
    picture,
    quantity,
    optionalChoices,
  }: MenuItem
): ApiMenuItem => ({
  category: category?.trim() ?? null,
  choices: choices ?? null,
  mealDescription: meal_Description?.trim() ?? null,
  mealPrice: meal_Price,
  name,
  optionalChoices: optionalChoices ?? null,
  outOfStock: !!outOfStock,
  picture: picture ?? null,
  quantity: quantity ?? null,
});
