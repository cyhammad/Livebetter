import { Choice } from "types";

interface OrderChoicesListProps {
  choices?: Choice[];
}

export const OrderChoicesList = ({ choices }: OrderChoicesListProps) => {
  if (!choices) {
    return null;
  }

  return (
    <p className="text-sm text-gray-600 line-clamp-2">
      {choices
        .map(
          (choice) =>
            `${choice.qty > 1 ? `${choice.qty} × ` : ""}${choice.name}`
        )
        .join(", ")}
    </p>
  );
};
