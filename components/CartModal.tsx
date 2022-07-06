import classNames from "classnames";
import { motion } from "framer-motion";
import { CreditCard, Trash } from "phosphor-react";
import { KeyboardEvent, MouseEvent, useEffect, useRef } from "react";

import { InputText } from "components/InputText";
import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { SelectShippingMethod } from "components/SelectShippingMethod";
import { useCartContext } from "hooks/useCartContext";
import { useRestaurantOrderValidation } from "hooks/useRestaurantOrderValidation";
import { useShippingMethodValidation } from "hooks/useShippingMethodValidation";
import { useUserContext } from "hooks/useUserContext";
import { getChoicesLabel } from "lib/getChoicesLabel";

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
    // setMenuItemCount,
    setTip,
    smallOrderFee,
    subtotal,
    tax,
    tip,
    total,
  } = useCartContext();
  const { shippingMethod, setShippingMethod } = useUserContext();
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount === 0 && prevCartCountRef.current !== 0) {
      onRequestClose && onRequestClose();
    }

    prevCartCountRef.current = cartCount;
  }, [cartCount, onRequestClose]);

  const { isShippingMethodValid, shippingMethodValidationMessage } =
    useShippingMethodValidation(cart?.restaurant, shippingMethod);

  const { isRestaurantOrderValid, restaurantOrderValidationMessage } =
    useRestaurantOrderValidation(cart?.restaurant);

  return (
    <Modal
      className="sm:max-w-xl md:max-w-xl"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <div className="flex flex-col gap-2 py-4 sm:py-6 px-4 sm:px-6">
        <h5 className="text-2xl font-bold">Cart</h5>
        <ul className="flex flex-col gap-2">
          {cart?.items.map((item, index) => {
            const choicesLabel = getChoicesLabel(item.choices);
            const optionalChoicesLabel = getChoicesLabel(item.optionalChoices);

            return (
              <motion.li className="" key={index}>
                <div
                  className="grid justify-between items-start"
                  style={{ gridTemplateColumns: "1fr auto auto" }}
                >
                  <b>{item.name}</b>
                  <button
                    className="py-1"
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
                </div>
                {choicesLabel ? (
                  <p className="text-sm text-gray-600">{choicesLabel}</p>
                ) : null}
                {optionalChoicesLabel ? (
                  <p className="text-sm text-gray-600">
                    {optionalChoicesLabel}
                  </p>
                ) : null}
                {/* <InputCounter
                  min={1}
                  onChange={(value) => {
                    if (value !== null) {
                      setMenuItemCount(index, value);
                    }
                  }}
                  value={item.count}
                /> */}
              </motion.li>
            );
          })}
        </ul>
        <p className="text-right tabular-nums flex justify-between">
          <b>Subtotal:</b> ${subtotal.toFixed(2)}
        </p>
        <p className="text-right tabular-nums flex justify-between items-center">
          <b>Tip:</b>
          <InputText
            className="text-right tabular-nums input-number-no-buttons w-20 px-0"
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
        <div className="flex flex-col gap-2">
          {!isRestaurantOrderValid && restaurantOrderValidationMessage ? (
            <p className="text-amber-600 text-sm sm:text-base font-semibold">
              {restaurantOrderValidationMessage}
            </p>
          ) : !isShippingMethodValid && shippingMethodValidationMessage ? (
            <p className="text-amber-600 text-sm sm:text-base font-semibold">
              {shippingMethodValidationMessage}
            </p>
          ) : null}
          <SelectShippingMethod
            value={shippingMethod}
            onChange={setShippingMethod}
            restaurant={cart?.restaurant}
          />
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
          primaryButtonProps={{
            className: classNames({
              "opacity-50": !isRestaurantOrderValid || !isShippingMethodValid,
            }),
            disabled: !isRestaurantOrderValid || !isShippingMethodValid,
          }}
        />
      </div>
    </Modal>
  );
};
