import { CartMenuItemChoices } from "types";

interface CartChoicesListProps {
  choices?: CartMenuItemChoices;
}

export const CartChoicesList = ({ choices }: CartChoicesListProps) => {
  if (!choices) {
    return null;
  }

  return (
    <>
      {Object.entries(choices).map(([category, options]) => (
        <p className="text-sm text-gray-600 line-clamp-2" key={category}>
          {category}:{" "}
          {options
            .map(
              (option) =>
                `${option.count > 1 ? `${option.count} × ` : ""}${option.name}`
            )
            .join(", ")}
        </p>
      ))}
    </>
  );
};
