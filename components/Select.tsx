import classNames from "classnames";
import type { PropsWithChildren } from "react";

export const Select = ({
  className,
  ...props
}: PropsWithChildren<JSX.IntrinsicElements["select"]>) => {
  return (
    <select
      className={classNames(
        "text-base bg-slate-100 rounded border-0 focus:ring-0 focus:border-black",
        className
      )}
      {...props}
    />
  );
};
