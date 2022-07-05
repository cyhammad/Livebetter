import { motion } from "framer-motion";
import { CreditCard, Trash } from "phosphor-react";
import { KeyboardEvent, MouseEvent, useEffect, useRef } from "react";

import { InputCounter } from "components/InputCounter";
import { InputText } from "components/InputText";
import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { useCartContext } from "hooks/useCartContext";

interface CartModalProps extends ReactModal.Props {
  onRequestClose?: (event?: MouseEvent | KeyboardEvent) => void;
}

export const CartModal = ({ isOpen, onRequestClose }: CartModalProps) => {
  const {
    cart,
    count: cartCount,
    deliveryFee,
    processingFee,
    removeMenuItem,
    serviceFee,
    setMenuItemCount,
    setTip,
    smallOrderFee,
    subtotal,
    tax,
    tip,
    total,
  } = useCartContext();
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount === 0 && prevCartCountRef.current !== 0) {
      onRequestClose && onRequestClose();
    }
  }, [cartCount, onRequestClose]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="flex flex-col gap-2 py-4 sm:py-6 px-4 sm:px-6">
        <h5 className="text-2xl font-bold">Cart</h5>
        <ul className="flex flex-col gap-1">
          {cart?.items.map((item, index) => (
            <motion.li
              className="grid justify-between items-center"
              style={{ gridTemplateColumns: "1fr auto auto" }}
              key={index}
            >
              <b>{item.name}</b>

              {/* <InputCounter
                  min={1}
                  onChange={(value) => {
                    if (value !== null) {
                      setMenuItemCount(index, value);
                    }
                  }}
                  value={item.count}
                /> */}
              <button
                className="self"
                onClick={() => removeMenuItem(index)}
                type="button"
              >
                <Trash
                  alt={`Remove item (${item.name})`}
                  size={16}
                  color="currentColor"
                  weight="duotone"
                  className="text-rose-800 w-4 h-4"
                />
              </button>
              <p className="min-w-[60px] text-right tabular-nums">
                ${(item.mealPrice * item.count).toFixed(2)}
              </p>
            </motion.li>
          ))}
        </ul>
        <p className="text-right tabular-nums flex justify-between">
          <b>Subtotal:</b> ${subtotal.toFixed(2)}
        </p>
        <p className="text-right tabular-nums flex justify-between items-center">
          <b>Tip:</b>
          <InputText
            className="text-right tabular-nums input-number-no-buttons w-20"
            onChange={(event) => {
              const nextTip = event.target.valueAsNumber;

              if (
                typeof nextTip === "number" &&
                !isNaN(nextTip) &&
                nextTip >= 0
              ) {
                setTip(nextTip);
              } else {
                setTip(0);
              }
            }}
            placeholder="$0.00"
            value={tip ? tip : ""}
            type="number"
            min={0}
          />
        </p>
        <div className="flex flex-col gap-0">
          {serviceFee ? (
            <p className="text-sm sm:text-base text-right tabular-nums flex justify-between">
              <span>Service fee:</span> ${serviceFee.toFixed(2)}
            </p>
          ) : null}
          {smallOrderFee ? (
            <p className="text-sm sm:text-base text-right tabular-nums flex justify-between">
              <span>Small order fee:</span> ${smallOrderFee.toFixed(2)}
            </p>
          ) : null}
          {deliveryFee ? (
            <p className="text-sm sm:text-base text-right tabular-nums flex justify-between">
              <span>Delivery fee:</span> ${deliveryFee.toFixed(2)}
            </p>
          ) : null}
          {processingFee ? (
            <p className="text-sm sm:text-base text-right tabular-nums flex justify-between">
              <span>Processing fee:</span> ${processingFee.toFixed(2)}
            </p>
          ) : null}
          <p className="text-sm sm:text-base text-right tabular-nums flex justify-between">
            <span>Tax:</span> ${tax.toFixed(2)}
          </p>
        </div>
        <ModalButtons
          secondaryButtonLabel="Cancel"
          secondaryButtonProps={{ onClick: onRequestClose }}
          primaryButtonLabel={
            <>
              <span className="flex items-center gap-2">
                <CreditCard
                  color="currentColor"
                  size={24}
                  weight="bold"
                  className="w-6 h-6"
                />
                <span className="flex-none">Check out</span>
              </span>
              <span className="bg-white/20 px-2 py-1 rounded">
                ${total.toFixed(2)}
              </span>
            </>
          }
          primaryButtonProps={{}}
        />
      </div>
    </Modal>
  );
};
