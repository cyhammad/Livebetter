import { CartMenuItemChoices } from "types";

export const getChoicesLabel = (choices?: CartMenuItemChoices): string => {
  if (!choices) {
    return "";
  }

  // Map each entry in choices into a string of the category's name and its
  // choices, then join those strings
  return Object.entries(choices ?? {})
    .map(
      ([category, options]) =>
        category +
        ": " +
        options
          .map(
            (option) =>
              // Only show `count` and `price` if they matter
              `${option.name}${option.count > 1 ? ` x${option.count}` : ""}${
                option.price > 0 ? ` $${option.price.toFixed(2)}` : ""
              }`
          )
          .join(", ")
    )
    .join("; ");
};
