import type { CartMenuItemChoices } from "types";

export const getCartMenuItemTotal = (
  mealPrice: number,
  count: number,
  choices?: CartMenuItemChoices,
  optionalChoices?: CartMenuItemChoices
): number => {
  const choicesTotal = Object.entries(choices ?? {})
    .flatMap(([, options]) => {
      return options.map(
        ({ price, count: optionCount }) => price * optionCount
      );
    })
    .reduce((acc, curr) => acc + curr, 0);

  const optionalChoicesTotal = Object.entries(optionalChoices ?? {})
    .flatMap(([, options]) => {
      return options.map(
        ({ price, count: optionCount }) => price * optionCount
      );
    })
    .reduce((acc, curr) => acc + curr, 0);

  return (mealPrice + choicesTotal + optionalChoicesTotal) * count;
};
