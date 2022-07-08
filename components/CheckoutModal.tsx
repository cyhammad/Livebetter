import { captureException } from "@sentry/nextjs";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import classNames from "classnames";
import { CreditCard, Taxi } from "phosphor-react";
import { KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { useMutation } from "react-query";

import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { useCartContext } from "hooks/useCartContext";
import { usePrevious } from "hooks/usePrevious";
import { fetchCreatePaymentIntent } from "lib/client/fetchCreatePaymentIntent";
import { getStripePromise } from "lib/getStripePromise";
import type {
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

  useEffect(() => {
    // Only create a payment method if this modal is open, and it previously was
    // not open
    if (!isOpen || wasOpen) {
      return;
    }

    const createPaymentIntentCart: CreatePaymentIntentCart = {
      items: cart?.items ?? [],
      restaurantName: cart?.restaurant?.Restaurant ?? "",
      tip: cart?.tip ?? 0,
    };

    createPaymentIntent(createPaymentIntentCart)
      .then((result) => {
        if (result && result.clientSecret) {
          setClientSecret(result.clientSecret);
        }
      })
      .catch((error) => {
        captureException(error, { extra: { createPaymentIntentCart } });
      });
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
        {isOpen && clientSecret ? (
          <Elements
            key={clientSecret}
            options={{ appearance: { theme: "flat" }, clientSecret }}
            stripe={getStripePromise()}
          >
            <PaymentElement />
            {/* <CardElement /> */}
          </Elements>
        ) : null}
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
