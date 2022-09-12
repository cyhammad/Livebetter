import { ApiMenuItem, ApiMenuItemChoices, MenuItem } from "types";

const toApiChoices = (
  choices?: Record<string, number>
): ApiMenuItemChoices | null => {
  if (!choices) {
    return null;
  }

  const entries = Object.entries(choices);

  if (entries.length === 0) {
    return null;
  }

  const apiChoices: ApiMenuItemChoices = entries.reduce(
    (acc, [categoryAndNamePair, price]) => {
      const categoryAndNamePairParts = categoryAndNamePair.split(")∞(");
      const category = categoryAndNamePairParts[0]?.trim();
      const name = categoryAndNamePairParts[1]?.trim();

      if (!category || !name || price < 0) {
        return acc;
      }

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push({
        name,
        price,
      });

      return acc;
    },
    {} as ApiMenuItemChoices
  );

  // Sort choices by price, from lowest to highest
  Object.entries(apiChoices).forEach(([, sortedChoices]) => {
    sortedChoices.sort((a, b) => a.price - b.price);
  });

  return apiChoices;
};

export const toApiMenuItem = (
  name: string,
  {
    addOnItems,
    allowNotes,
    category,
    choices,
    isVegan,
    meal_Description,
    meal_Price,
    outOfStock,
    picture,
    popular,
    quantity,
    optionalChoices,
  }: MenuItem
): ApiMenuItem => {
  return {
    addOnItems: addOnItems ?? null,
    allowNotes: allowNotes ?? true,
    category: category?.trim() ?? null,
    choices: toApiChoices(choices) ?? null,
    isPopular: !!popular,
    isVegan: isVegan !== false,
    mealDescription: meal_Description?.trim() ?? null,
    mealPrice: meal_Price,
    name,
    optionalChoices: toApiChoices(optionalChoices) ?? null,
    outOfStock: !!outOfStock,
    picture: picture ?? null,
    quantity: quantity ?? null,
  };
};
