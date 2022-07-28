import { captureException } from "@sentry/nextjs";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import classNames from "classnames";
import { Spinner, Taxi } from "phosphor-react";
import { FormEvent, KeyboardEvent, MouseEvent, useState } from "react";

import { ModalButtons } from "components/ModalButtons";
import { useUserContext } from "hooks/useUserContext";
import { reportEvent } from "lib/client/gtag";

interface CheckoutFormProps {
  onRequestPrevious?: (event?: MouseEvent | KeyboardEvent) => void;
  total: number;
}

export const CheckoutForm = ({
  onRequestPrevious,
  total,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>();
  const { email } = useUserContext();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return null;
    }

    setMessage("");
    setIsLoading(true);

    try {
      reportEvent({
        action: "add_payment_info",
        category: "Checkout",
        label: "Submit payment",
      });

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: email,
        },
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }

      setIsLoading(false);
    } catch (err) {
      setMessage("An unknown error occurred. Please try again.");

      captureException(err, {
        extra: { message: "Failed to charge customer", email },
      });
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <PaymentElement />
      {message ? (
        <p className="text-amber-600 text-sm sm:text-base font-semibold">
          {message}
        </p>
      ) : null}
      <div
        className="
          z-30 flex flex-col gap-3 justify-between
          p-4 sm:p-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6
          bg-white sticky
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
                {isLoading ? (
                  <Spinner
                    alt=""
                    color="currentColor"
                    size={24}
                    weight="bold"
                    className="w-6 h-6 animate-spin-slow"
                  />
                ) : (
                  <>${total.toFixed(2)}</>
                )}
              </span>
            </>
          }
          primaryButtonProps={{
            className: classNames({
              "opacity-50": !stripe || !elements || isLoading,
            }),
            disabled: !stripe || !elements || isLoading,
            type: "submit",
          }}
        />
      </div>
    </form>
  );
};
