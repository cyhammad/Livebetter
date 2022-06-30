import type {
  CartMenuItemChoice,
  CartMenuItemChoices,
  CartMenuItemChoicesInput,
} from "types";

export const toCartMenuItemChoices = (
  input: CartMenuItemChoicesInput
): CartMenuItemChoices => {
  return Object.fromEntries(
    Object.entries(input).map(([category, choices]) => {
      /**
       * Remove choices that have a count of 0 or null
       */
      const filteredChoices: Array<CartMenuItemChoice> = choices
        .map(({ count, ...rest }) => ({ ...rest, count: count ?? 0 }))
        .filter(({ count }) => count !== 0);

      return [category, filteredChoices];
    })
  );
};
