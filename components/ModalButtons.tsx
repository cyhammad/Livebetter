import classNames from "classnames";
import type { ReactNode } from "react";

import { ButtonPrimary } from "components/ButtonPrimary";

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
        type="button"
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
      <ButtonPrimary className={primaryButtonClassName} {...restPrimary}>
        {primaryButtonLabel}
      </ButtonPrimary>
    </div>
  );
};
