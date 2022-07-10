import classNames from "classnames";

export const InputText = ({
  className,
  ...props
}: JSX.IntrinsicElements["input"]) => {
  return (
    <input
      type="text"
      className={classNames(
        className,
        `
          border-0 bg-gray-100 rounded-lg px-2
          text-black
          focus:ring-0 focus:border-transparent
          mt-0
        `
      )}
      {...props}
    />
  );
};
