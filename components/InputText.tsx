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
          focus:border-transparent
          mt-0
          ring-sky-50 focus:ring-transparent
          required:invalid:ring-4
          required:invalid:ring-offset-1
          transition-shadow
        `
      )}
      {...props}
    />
  );
};
