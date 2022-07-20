import classNames from "classnames";
import { motion } from "framer-motion";
import { ArrowRight, Tote, Trash } from "phosphor-react";
import {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CartChoicesList } from "components/CartChoicesList";
import { InputText } from "components/InputText";
import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { Select } from "components/Select";
import { SelectShippingMethod } from "components/SelectShippingMethod";
import { useCartContext } from "hooks/useCartContext";
import { useRestaurantOrderValidation } from "hooks/useRestaurantOrderValidation";
import { useShippingMethodValidation } from "hooks/useShippingMethodValidation";
import { useUserContext } from "hooks/useUserContext";
import { toMoney } from "lib/toMoney";
import type { ModalProps } from "types";

interface CartModalProps extends ModalProps {
  onRequestClose?: (event?: MouseEvent | KeyboardEvent) => void;
  onRequestNext?: (event?: MouseEvent | KeyboardEvent) => void;
}

export const CartModal = ({
  isOpen,
  onRequestClose,
  onRequestNext,
  ...restProps
}: CartModalProps) => {
  const {
    cart,
    count: cartCount,
    deliveryFee,
    processingFee,
    removeMenuItem,
    serviceFee,
    setTip,
    smallOrderFee,
    subtotal,
    tax,
    tip,
    total,
  } = useCartContext();
  const { shippingMethod, setShippingMethod } = useUserContext();
  const prevCartCountRef = useRef(cartCount);
  const [selectedTipPercent, setSelectedTipPercent] = useState<
    15 | 18 | 20 | "other"
  >(18);

  const { isShippingMethodValid, shippingMethodValidationMessage } =
    useShippingMethodValidation(cart?.restaurant, shippingMethod);

  const { isRestaurantOrderValid, restaurantOrderValidationMessage } =
    useRestaurantOrderValidation(cart?.restaurant);

  useEffect(() => {
    if (cartCount === 0 && prevCartCountRef.current !== 0) {
      onRequestClose && onRequestClose();
    }

    prevCartCountRef.current = cartCount;
  }, [cartCount, onRequestClose]);

  const [lowTip, midTip, highTip] = useMemo((): [number, number, number] => {
    const low = toMoney(Math.ceil(subtotal * 0.15));
    let mid = toMoney(Math.ceil(subtotal * 0.18));
    let high = toMoney(Math.ceil(subtotal * 0.2));

    if (mid === low) {
      mid++;
    }

    if (high <= mid) {
      high++;
    }

    return [low, mid, high];
  }, [subtotal]);

  useEffect(() => {
    switch (selectedTipPercent) {
      case 15:
        setTip(lowTip);

        break;
      case 18:
        setTip(midTip);

        break;
      case 20:
        setTip(highTip);

        break;
      case "other":
        setTip(midTip);

        break;
      default:
        // do nothing;
        break;
    }
  }, [highTip, lowTip, midTip, selectedTipPercent, setTip]);

  return (
    <Modal
      {...restProps}
      className="sm:max-w-xl md:max-w-xl"
      style={{
        overlay: {
          background: "transparent",
          backdropFilter: "none",
        },
      }}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <div className="flex flex-col gap-3 py-4 sm:py-6 px-4 sm:px-6">
        <h5 className="text-2xl font-bold">
          <span className="flex gap-2 items-center">
            <Tote
              alt=""
              size={32}
              color="currentColor"
              className="text-emerald-600"
              weight="duotone"
            />
            <span>
              <span className="capitalize">
                {cart?.restaurant?.Restaurant.toLowerCase()}
              </span>
            </span>
          </span>
        </h5>
        <ul className="flex flex-col gap-2">
          {cart?.items.map((item, index) => {
            return (
              <motion.li className="flex flex-col gap-1" key={index}>
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
                <CartChoicesList choices={item.choices} />
                <CartChoicesList choices={item.optionalChoices} />
                {item.notes ? (
                  <p className="text-sm text-gray-600 ml-4">
                    <b>Notes</b> {item.notes}
                  </p>
                ) : null}
              </motion.li>
            );
          })}
        </ul>
        <p className="text-right tabular-nums flex justify-between">
          <b>Subtotal:</b>{" "}
          <b className="font-semibold">${subtotal.toFixed(2)}</b>
        </p>
        <p className="text-right tabular-nums flex justify-between items-center">
          <b>Tip:</b>
          <span className="flex gap-2">
            <Select
              value={selectedTipPercent}
              className="md:text-base"
              onChange={(event) => {
                switch (event.target.value) {
                  case "15":
                    setSelectedTipPercent(15);

                    break;
                  case "18":
                    setSelectedTipPercent(18);

                    break;
                  case "20":
                    setSelectedTipPercent(20);

                    break;
                  case "other":
                    setSelectedTipPercent("other");

                    break;
                  default:
                    // do nothing;
                    break;
                }
              }}
            >
              <option value={15}>${lowTip.toFixed(2)}</option>
              <option value={18}>${midTip.toFixed(2)}</option>
              <option value={20}>${highTip.toFixed(2)}</option>
              <option value="other">Other</option>
            </Select>
            {selectedTipPercent === "other" ? (
              <InputText
                className="text-right tabular-nums input-number-no-buttons w-20 px-0 -mr-2"
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
            ) : null}
          </span>
        </p>
        <div className="flex flex-col gap-0">
          {serviceFee ? (
            <p className="text-sm text-right tabular-nums flex justify-between">
              <span>Service fee:</span> ${serviceFee.toFixed(2)}
            </p>
          ) : null}
          {smallOrderFee ? (
            <p className="text-sm text-right tabular-nums flex justify-between">
              <span>Small order fee:</span> ${smallOrderFee.toFixed(2)}
            </p>
          ) : null}
          {deliveryFee ? (
            <p className="text-sm text-right tabular-nums flex justify-between">
              <span>Delivery fee:</span> ${deliveryFee.toFixed(2)}
            </p>
          ) : null}
          {processingFee ? (
            <p className="text-sm text-right tabular-nums flex justify-between">
              <span>Processing fee:</span> ${processingFee.toFixed(2)}
            </p>
          ) : null}
          <p className="text-sm text-right tabular-nums flex justify-between">
            <span>Tax:</span> ${tax.toFixed(2)}
          </p>
        </div>
        <p className="text-right tabular-nums flex justify-between">
          <b>Total:</b> <b className="font-semibold">${total.toFixed(2)}</b>
        </p>
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
      </div>
      <div
        className="
          z-30 flex flex-col gap-3 justify-between p-4 sm:p-6
          bg-white sticky
          bottom-0 border-t border-gray-200
        "
      >
        <ModalButtons
          secondaryButtonLabel="Back"
          secondaryButtonProps={{ onClick: onRequestClose }}
          primaryButtonLabel={
            <>
              Continue
              <span className="bg-white/20 px-1 py-1 rounded">
                <ArrowRight
                  alt=""
                  color="currentColor"
                  size={24}
                  weight="bold"
                  className="w-6 h-6"
                />
              </span>
            </>
          }
          primaryButtonProps={{
            className: classNames({
              "opacity-50": !isRestaurantOrderValid || !isShippingMethodValid,
            }),
            disabled: !isRestaurantOrderValid || !isShippingMethodValid,
            onClick: onRequestNext,
          }}
        />
      </div>
    </Modal>
  );
};
