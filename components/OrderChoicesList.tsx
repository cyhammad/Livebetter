import { Choice } from "types";

interface OrderChoicesListProps {
  choices?: Choice[];
}

export const OrderChoicesList = ({ choices }: OrderChoicesListProps) => {
  if (!choices) {
    return null;
  }

  return (
    <section className="text-sm text-gray-600 ml-4">
      {/* Collapse the choice onto 1 line if there is only 1 choice */}
      {choices.length === 1 ? (
        <p className="flex justify-between gap-1">
          <span>
            <b>{choices[0].name}</b>
          </span>

          <span className="tabular-nums">
            {choices[0].qty > 1 ? `${choices[0].qty} x` : ""}
            {choices[0].price >= 0 ? ` $${choices[0].price.toFixed(2)}` : ""}
          </span>
        </p>
      ) : (
        <ul className="list-disc ml-4">
          {choices.map((option, index) => (
            // Only show `count` and `price` if they matter
            <li key={index}>
              <p className="flex justify-between">
                <b>{option.name}</b>
                <span className="tabular-nums">
                  {option.qty > 1 ? `${option.qty} x` : ""}
                  {option.price >= 0 ? ` $${option.price.toFixed(2)}` : ""}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
