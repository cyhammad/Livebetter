import classNames from "classnames";
import { CreditCard, Taxi } from "phosphor-react";
import { KeyboardEvent, MouseEvent } from "react";

import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { useCartContext } from "hooks/useCartContext";
import type { ModalProps } from "types";

interface CheckoutModalProps extends ModalProps {
  onRequestClose?: (event?: MouseEvent | KeyboardEvent) => void;
  onRequestPrevious?: (event?: MouseEvent | KeyboardEvent) => void;
}

export const CheckoutModal = ({
  isOpen,
  onRequestClose,
  onRequestPrevious,
  ...restProps
}: CheckoutModalProps) => {
  const { total } = useCartContext();

  return (
    <Modal
      className="sm:max-w-xl md:max-w-xl"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          background: "transparent",
          backdropFilter: "none",
        },
      }}
      {...restProps}
    >
      <div className="flex flex-col gap-3 py-4 sm:py-6 px-4 sm:px-6">
        <h5 className="text-2xl font-bold">
          <span className="flex gap-2 items-center">
            <CreditCard
              alt=""
              size={32}
              color="currentColor"
              className="text-emerald-600"
              weight="duotone"
            />
            <span>
              <span className="capitalize">Check out</span>
            </span>
          </span>
        </h5>

        <ModalButtons
          secondaryButtonLabel="Back"
          secondaryButtonProps={{ onClick: onRequestPrevious }}
          primaryButtonLabel={
            <>
              <span className="flex items-center gap-2">
                <Taxi
                  color="currentColor"
                  size={24}
                  weight="bold"
                  className="w-6 h-6"
                />
                <span className="flex-none">Place order</span>
              </span>
              <span className="bg-white/20 px-2 py-1 rounded">
                ${total.toFixed(2)}
              </span>
            </>
          }
          primaryButtonProps={{
            className: classNames({
              "opacity-50": false,
            }),
            disabled: false,
          }}
        />
      </div>
    </Modal>
  );
};
