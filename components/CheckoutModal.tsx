import { captureException } from "@sentry/nextjs";
import { Elements } from "@stripe/react-stripe-js";
import classNames from "classnames";
import { deepEqual } from "fast-equals";
import { CreditCard, Taxi } from "phosphor-react";
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";

import { CheckoutForm } from "components/CheckoutForm";
import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { useCartContext } from "hooks/useCartContext";
import { usePrevious } from "hooks/usePrevious";
import { fetchCreatePaymentIntent } from "lib/client/fetchCreatePaymentIntent";
import { getStripePromise } from "lib/getStripePromise";
import type {
  Cart,
  CreatePaymentIntentCart,
  GetCreatePaymentIntentResult,
  ModalProps,
} from "types";

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
  const { cart, total } = useCartContext();
  const { mutateAsync: createPaymentIntent } = useMutation<
    GetCreatePaymentIntentResult,
    unknown,
    CreatePaymentIntentCart
  >((variables) => fetchCreatePaymentIntent(variables), {
    mutationKey: ["create_payment_intent"],
  });
  const [clientSecret, setClientSecret] = useState<string>();

  const wasOpen = usePrevious(isOpen);
  const cartThatCreatedThePaymentIntentRef = useRef<Cart>();

  useEffect(() => {
    // Only create a payment method if
    // - The checkout modal is open,
    // - and it previously was not open,
    // - and the cart changed
    if (
      isOpen &&
      !wasOpen &&
      !deepEqual(cart, cartThatCreatedThePaymentIntentRef.current)
    ) {
      const createPaymentIntentCart: CreatePaymentIntentCart = {
        items: cart?.items ?? [],
        restaurantName: cart?.restaurant?.Restaurant ?? "",
        tip: cart?.tip ?? 0,
      };

      cartThatCreatedThePaymentIntentRef.current = cart;

      createPaymentIntent(createPaymentIntentCart)
        .then((result) => {
          if (result && result.clientSecret) {
            setClientSecret(result.clientSecret);
          }
        })
        .catch((error) => {
          captureException(error, { extra: { createPaymentIntentCart } });
        });
    }
  }, [cart, createPaymentIntent, isOpen, wasOpen]);

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
        {clientSecret ? (
          <Elements
            options={{ appearance: { theme: "flat" }, clientSecret }}
            stripe={getStripePromise()}
          >
            <CheckoutForm onRequestPrevious={onRequestPrevious} total={total} />
          </Elements>
        ) : (
          // TODO: Refactor this
          // This is weird, but these buttons are not used when the payment form
          // is visible. They're a placeholder until we can load the buttons
          // where the payment logic exists (CheckoutForm)
          <div
            className="
              z-30 flex flex-col gap-3 justify-between p-4 sm:p-6
              bg-white sticky -mx-4 sm:-mx-6 -mb-4 sm:-mb-6
              bottom-0 border-t border-gray-200
            "
          >
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
                  "opacity-50": true,
                }),
                disabled: true,
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
