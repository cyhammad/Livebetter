import classNames from "classnames";
import type { PropsWithChildren } from "react";

export const Select = ({
  className,
  ...props
}: PropsWithChildren<JSX.IntrinsicElements["select"]>) => {
  return (
    <select
      className={classNames(
        "text-base md:text-lg bg-slate-100 rounded my-1 border-0 focus:ring-0 focus:border-black",
        className
      )}
      {...props}
    />
  );
};
