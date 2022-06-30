import classNames from "classnames";

export const Checkbox = ({
  className,
  ...props
}: JSX.IntrinsicElements["input"]) => {
  return (
    <input
      type="checkbox"
      className={classNames(
        className,
        `
          bg-slate-100
          text-slate-700
          border-transparent
          shadow-sm
          focus:border-slate-300
          focus:ring
          focus:ring-offset-0
          focus:ring-slate-200
          focus:ring-opacity-50
          rounded
        `
      )}
      {...props}
    />
  );
};
