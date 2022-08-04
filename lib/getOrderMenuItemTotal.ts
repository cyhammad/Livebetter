import type { Choice } from "types";

export const getOrderMenuItemTotal = (
  mealPrice: number,
  count: number,
  choices: Choice[] = [],
  optionalChoices: Choice[] = []
): number => {
  const choicesTotal = choices
    .map(({ price, qty }) => price * (qty ?? 0))
    .reduce((acc, curr) => acc + curr, 0);

  const optionalChoicesTotal = optionalChoices
    .map(({ price, qty }) => price * (qty ?? 0))
    .reduce((acc, curr) => acc + curr, 0);

  return (mealPrice + choicesTotal + optionalChoicesTotal) * count;
};
