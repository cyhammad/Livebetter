import type { CartMenuItemChoices, CartMenuItemChoicesInput } from "types";

export const getCartMenuItemTotal = (
  mealPrice: number,
  count: number,
  choices?: CartMenuItemChoices | CartMenuItemChoicesInput,
  optionalChoices?: CartMenuItemChoices | CartMenuItemChoicesInput
): number => {
  const choicesTotal = Object.entries(choices ?? {})
    .flatMap(([, options]) => {
      return options.map(
        ({ price, count: optionCount }) => price * (optionCount ?? 0)
      );
    })
    .reduce((acc, curr) => acc + curr, 0);

  const optionalChoicesTotal = Object.entries(optionalChoices ?? {})
    .flatMap(([, options]) => {
      return options.map(
        ({ price, count: optionCount }) => price * (optionCount ?? 0)
      );
    })
    .reduce((acc, curr) => acc + curr, 0);

  return (mealPrice + choicesTotal + optionalChoicesTotal) * count;
};
