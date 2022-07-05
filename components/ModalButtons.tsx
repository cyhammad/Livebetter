import classNames from "classnames";
import type { ReactNode } from "react";

interface ModalButtonsProps {
  primaryButtonProps: JSX.IntrinsicElements["button"];
  primaryButtonLabel: ReactNode;
  secondaryButtonProps: JSX.IntrinsicElements["button"];
  secondaryButtonLabel: ReactNode;
}

export const ModalButtons = ({
  primaryButtonProps,
  primaryButtonLabel,
  secondaryButtonProps,
  secondaryButtonLabel,
}: ModalButtonsProps) => {
  const { className: primaryButtonClassName, ...restPrimary } =
    primaryButtonProps;
  const { className: secondaryButtonClassName, ...restSecondary } =
    secondaryButtonProps;

  return (
    <div className="flex items-center gap-4 sm:justify-end">
      <button
        className={classNames(
          secondaryButtonClassName,
          `
            bg-gray-600 text-white py-3 px-4 rounded font-bold
          `
        )}
        {...restSecondary}
      >
        {secondaryButtonLabel}
      </button>
      <button
        className={classNames(
          primaryButtonClassName,
          `
            bg-emerald-600 text-white py-2 pr-2 pl-4 rounded font-bold
            flex gap-2 sm:gap-4 items-center justify-between
            w-full transition-opacity
          `
        )}
        {...restPrimary}
      >
        {primaryButtonLabel}
      </button>
    </div>
  );
};
