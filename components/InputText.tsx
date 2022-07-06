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
          border-0 border-b border-b-black
          text-black
          focus:ring-0 focus:border-black
          mt-0
        `
      )}
      {...props}
    />
  );
};
