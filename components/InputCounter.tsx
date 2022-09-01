import classNames from "classnames";
import { Minus, Plus } from "phosphor-react";

interface InputCounterProps {
  className?: string;
  onChange: (value: number | null) => void;
  value: number | null;
  min?: number;
}

export const InputCounter = ({
  className,
  onChange,
  value,
  min = 0,
}: InputCounterProps) => {
  const defaultedValue = value ?? min;

  return (
    <span
      className={classNames(
        className,
        "flex px-2 gap-1 bg-slate-100 rounded border-2 border-slate-200"
      )}
    >
      <button
        disabled={defaultedValue === min}
        onClick={() => onChange(defaultedValue - 1)}
        type="button"
      >
        <Minus alt={`Decrease count to ${defaultedValue - 1}`} size={20} />
      </button>
      <input
        className="
          w-6 sm:w-10 appearance-none bg-slate-100 border-0 text-center input-number-no-buttons
          px-0 sm:px-1 text-sm sm:text-base
        "
        min={min}
        step={1}
        type="number"
        placeholder="0"
        value={value ?? ""}
        onChange={(event) => {
          // Only allow positive numbers
          const nextValue = event.target.valueAsNumber;

          // Reset to 0
          if (typeof nextValue !== "number" || isNaN(nextValue)) {
            onChange(null);
          } else {
            onChange(Math.abs(nextValue));
          }
        }}
      />
      <button type="button" onClick={() => onChange(defaultedValue + 1)}>
        <Plus alt={`Increase count to ${defaultedValue + 1}`} size={20} />
      </button>
    </span>
  );
};
