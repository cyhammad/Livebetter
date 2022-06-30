import { CartMenuItemChoicesInput } from "types";

export const getChoicesCount = (choices?: CartMenuItemChoicesInput): number => {
  if (!choices) {
    return 0;
  }

  return Object.entries(choices).reduce(
    (acc, [, options]) =>
      acc + options.reduce((acc2, { count }) => acc2 + (count ?? 0), 0),
    0
  );
};
