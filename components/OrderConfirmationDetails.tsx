import { captureException } from "@sentry/nextjs";
import { useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

import { OrderChoicesList } from "components/OrderChoicesList";
import { useCartContext } from "hooks/useCartContext";
import { getCartFees } from "lib/getCartPricingBreakdown";
import { getOrderMenuItemTotal } from "lib/getOrderMenuItemTotal";
import type { ApiOrder, ShippingMethod } from "types";

interface OrderConfirmationDetailsProps {
  order: ApiOrder | null;
}

export const OrderConfirmationDetails = ({
  order,
}: OrderConfirmationDetailsProps) => {
  const stripe = useStripe();
  const [paymentMessage, setPaymentMessage] = useState<string>();
  const { cart, emptyCart } = useCartContext();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            setPaymentMessage("Payment succeeded!");

            // Check if our current cart's client secret matches the client secret
            // for this order. If it does, that means the user was just redirected
            // here from a successful order (vs just viewing this order later), so
            // we should clear their cart.
            if (cart?.paymentIntentClientSecret === clientSecret) {
              emptyCart();
            }

            break;
          case "processing":
            setPaymentMessage("Your payment is processing.");

            break;
          case "requires_payment_method":
            setPaymentMessage(
              "Your payment was not successful, please try again."
            );

            break;
          default:
            setPaymentMessage("Something went wrong.");

            break;
        }
      })
      .catch((err) => {
        captureException(err, {
          extra: { message: "Failed to retrieve payment intent", clientSecret },
        });
        setPaymentMessage("Something went wrong.");
      });
  }, [cart?.paymentIntentClientSecret, emptyCart, stripe]);

  const shippingMethod: ShippingMethod =
    order?.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery";

  const { tax, deliveryFee, processingFee, serviceFee, smallOrderFee } =
    getCartFees(order?.subTotal ?? 0, shippingMethod, order?.discount);

  return (
    <div className="flex flex-col gap-6">
      {order ? (
        <>
          <section className="px-4 sm:px-6 flex flex-col gap-4">
            {shippingMethod === "delivery" ? (
              <>
                <h3 className="text-xl font-bold underline">Delivery to</h3>
                <div>
                  <p>
                    {order.deliver_to.firstName} {order.deliver_to.lastName}
                  </p>
                  <p>
                    {order.deliver_to.address}
                    {order.deliver_to.appartmentNo
                      ? ` (${order.deliver_to.appartmentNo})`
                      : null}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold underline">Pick-up for</h3>
                <div>
                  <p>
                    {order.deliver_to.firstName} {order.deliver_to.lastName}
                  </p>
                </div>
              </>
            )}
          </section>
          <section className="px-4 sm:px-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold underline">Order details</h3>
            <ul className="flex flex-col gap-4">
              {order.order_items.map((item, index) => (
                <li className="flex gap-2 items-center" key={index}>
                  <span className="flex-none font-bold">{item.qty} ×</span>
                  <div className="flex flex-col gap-0 w-full">
                    <p
                      className="grid justify-between items-start line-clamp-1"
                      style={{ gridTemplateColumns: "1fr auto auto" }}
                    >
                      {item.item_id}
                    </p>
                    <OrderChoicesList choices={item.choices} />
                    <OrderChoicesList choices={item.optionalChoices} />
                    {item.item_description ? (
                      <p className="text-sm text-gray-600 ml-4">
                        Notes: {item.item_description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-1">
                    <span className="min-w-[60px] text-right tabular-nums">
                      $
                      {getOrderMenuItemTotal(
                        item.item_price ?? 0,
                        item.qty,
                        item.choices,
                        item.optionalChoices
                      ).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-right tabular-nums flex justify-between">
              <b>Subtotal:</b>{" "}
              <b className="font-semibold">${order.subTotal?.toFixed(2)}</b>
            </p>
            {order.discount ?? 0 > 0 ? (
              <p className="text-right tabular-nums flex justify-between">
                <b>Discount:</b>{" "}
                <b className="font-semibold text-emerald-600">
                  -${order.discount?.toFixed(2)}
                </b>
              </p>
            ) : null}
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
              <b>Tip:</b>{" "}
              <b className="font-semibold">${order.tip?.toFixed(2)}</b>
            </p>
            <p className="text-right tabular-nums flex justify-between">
              <b>Total:</b>{" "}
              <b className="font-semibold">${order.total.toFixed(2)}</b>
            </p>
            <p>{paymentMessage}</p>
          </section>
        </>
      ) : null}
    </div>
  );
};
