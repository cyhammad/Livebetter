import classNames from "classnames";

export const ButtonPrimary = ({
  className,
  disabled,
  ...props
}: JSX.IntrinsicElements["button"]) => {
  return (
    <button
      className={classNames(
        className,
        `
          bg-emerald-600 text-white py-2 pr-2 pl-4 rounded font-bold
          flex gap-2 sm:gap-4 items-center justify-between
          w-full transition-opacity
        `,
        { "opacity-50": disabled }
      )}
      disabled={disabled}
      type="button"
      {...props}
    />
  );
};
