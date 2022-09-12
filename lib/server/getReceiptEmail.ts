import fs from "fs";
import path from "path";

import { format } from "date-fns";
import utcToZonedTime from "date-fns-tz/esm/utcToZonedTime";
import Handlebars from "handlebars";
import Stripe from "stripe";

import { getDeliveryTimeLabel } from "lib/getDeliveryTimeLabel";
import { getOrderMenuItemTotal } from "lib/getOrderMenuItemTotal";
import { restaurantNameToStatementDescriptorSuffix } from "lib/restaurantNameToStatementDescriptorSuffix";
import type { Order } from "types";

interface GetReceiptEmailOptions {
  order: Order;
  orderId: string;
  paymentIntentId: string;
}

export const getReceiptEmail = async ({
  order,
  orderId,
  paymentIntentId,
}: GetReceiptEmailOptions) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
    typescript: true,
  });

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  let paymentMethod;

  if (typeof paymentIntent.payment_method === "string") {
    const paymentMethodId = paymentIntent.payment_method;

    paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  } else if (paymentIntent.payment_method) {
    paymentMethod = paymentIntent.payment_method;
  }

  if (!paymentMethod) {
    throw new Error("Could not retrieve payment method");
  }

  const statementDescriptorSuffix = restaurantNameToStatementDescriptorSuffix(
    order.restaurant_id
  );

  const creditCardLastFour = paymentMethod.card ? paymentMethod.card.last4 : "";
  const creditCardBrand = paymentMethod.card
    ? paymentMethod.card.brand.toUpperCase()
    : "";

  const items = order.order_items.map((item) => {
    return {
      description: item.item_id,
      price: `$${getOrderMenuItemTotal(
        item.item_price ?? 0,
        item.qty,
        item.choices,
        item.optionalChoices
      ).toFixed(2)}`,
      priced: `$${item.item_price?.toFixed(2)}`,
      choices: [...item.choices, ...(item.optionalChoices ?? [])]
        .map((choice) => {
          return choice.qty > 1
            ? `${choice.qty} × ${choice.name}`
            : choice.name;
        })
        .join(", "),
      count: item.qty,
      note: item.item_description,
    };
  });

  const orderHtml = fs
    .readFileSync(path.resolve("./templates/receipt.html"))
    .toString();
  const template = Handlebars.compile(orderHtml);

  const isTipHigh =
    order.subTotal && order.tip && order.tip / order.subTotal >= 0.2;

  return template({
    creditCardBrand,
    creditCardLastFour,
    date: format(
      utcToZonedTime(order.created_at.toDate(), "America/New_York"),
      "PP, pp"
    ),
    deliveryFee: order.deliveryFee ? `$${order.deliveryFee.toFixed(2)}` : null,
    discount: order.discount ? `-$${order.discount.toFixed(2)}` : null,
    dropoffNote: order.deliver_to.dropoff_note,
    name: order.deliver_to.firstName,
    processingFee: order.processingFee
      ? `$${order.processingFee.toFixed(2)}`
      : null,
    isTipHigh,
    items,
    receiptId: orderId.slice(0, 7),
    receiptUrl: `${
      process.env.VERCEL_ENV === "production"
        ? "https://www.livebetterphl.com"
        : "https://live-better-web.vercel.app"
    }/order-confirmation?payment_intent=${paymentIntentId}`,
    restaurantName: order.restaurant_id.toLowerCase(),
    serviceFee: order.serviceFee ? `$${order.serviceFee.toFixed(2)}` : null,
    smallOrderFee: order.smallOrderFee
      ? `$${order.smallOrderFee.toFixed(2)}`
      : null,
    statementDescriptorSuffix,
    subtotal: order.subTotal ? `$${order.subTotal.toFixed(2)}` : null,
    tax: order.tax ? `$${order.tax.toFixed(2)}` : null,
    tip: order.tip ? `$${order.tip.toFixed(2)}` : null,
    total: `$${order.total.toFixed(2)}`,
    deliveryTime: order.waitTime
      ? getDeliveryTimeLabel(order.waitTime, order.created_at.toDate())
      : null,
  });
};
