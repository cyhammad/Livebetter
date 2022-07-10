import classNames from "classnames";

export const InputTextarea = ({
  className,
  ...props
}: JSX.IntrinsicElements["textarea"]) => {
  return (
    <textarea
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
