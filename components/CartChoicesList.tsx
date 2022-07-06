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
      {Object.entries(choices ?? {}).map(([category, options]) => (
        <section className="text-sm text-gray-600 ml-4" key={category}>
          {/* Collapse the choice onto 1 line if there is only 1 choice */}
          {options.length === 1 ? (
            <p className="flex justify-between gap-1">
              <span>
                <b>{category}</b> {options[0].name}
              </span>

              <span className="tabular-nums">
                {options[0].count > 1 ? `${options[0].count} x` : ""}
                {options[0].price >= 0
                  ? ` $${options[0].price.toFixed(2)}`
                  : ""}
              </span>
            </p>
          ) : (
            <>
              <b>{category}</b>
              <ul className="list-disc ml-4">
                {options.map((option, index) => (
                  // Only show `count` and `price` if they matter
                  <li key={index}>
                    <p className="flex justify-between">
                      {option.name}
                      <span className="tabular-nums">
                        {option.count > 1 ? `${option.count} x` : ""}
                        {option.price >= 0
                          ? ` $${option.price.toFixed(2)}`
                          : ""}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ))}
    </>
  );
};
