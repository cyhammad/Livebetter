import fs from "fs";
import path from "path";

import { format } from "date-fns";
import utcToZonedTime from "date-fns-tz/esm/utcToZonedTime";
import Handlebars from "handlebars";
import Stripe from "stripe";

import { getCartPricingBreakdown } from "lib/getCartPricingBreakdown";
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
    apiVersion: "2020-08-27",
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

  const receiptDetails = order.order_items.map((item) => {
    return {
      description: item.item_id,
      amount: `$${item.item_price?.toFixed(2)}`,
      choices: [...item.choices, ...(item.optionalChoices ?? [])].map(
        (choice) => {
          return {
            name:
              choice.qty > 1 ? `${choice.qty} × ${choice.name}` : choice.name,
            price: choice.price ? `$${choice.price?.toFixed(2)}` : "",
          };
        }
      ),
      note: item.item_description,
    };
  });

  const { serviceFee, smallOrderFee, deliveryFee, processingFee, tax } =
    getCartPricingBreakdown({
      subtotal: order.subTotal,
      discount: order.discount,
      tip: order.tip,
      shippingMethod:
        order.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery",
    });

  const orderHtml = fs
    .readFileSync(path.resolve("./templates/order.html"))
    .toString();
  const template = Handlebars.compile(orderHtml);

  return template({
    creditCardBrand,
    creditCardLastFour,
    date: format(
      utcToZonedTime(order.created_at.toDate(), "America/New_York"),
      "PP, pp"
    ),
    deliveryFee: deliveryFee ? `$${deliveryFee.toFixed(2)}` : null,
    discount: order.discount ? `-$${order.discount.toFixed(2)}` : null,
    dropoffNote: order.deliver_to.dropoff_note,
    name: order.deliver_to.firstName,
    processingFee: processingFee ? `$${processingFee.toFixed(2)}` : null,
    receiptDetails,
    receiptId: orderId.slice(0, 7),
    receiptUrl: `${
      process.env.VERCEL_ENV === "production"
        ? "https://www.livebetterphl.com"
        : "https://live-better-web.vercel.app"
    }/order-confirmation?payment_intent=${paymentIntentId}`,
    restaurantName: order.restaurant_id.toLowerCase(),
    serviceFee: serviceFee ? `$${serviceFee.toFixed(2)}` : serviceFee,
    smallOrderFee: smallOrderFee
      ? `$${smallOrderFee.toFixed(2)}`
      : smallOrderFee,
    statementDescriptorSuffix,
    subtotal: order.subTotal ? `$${order.subTotal.toFixed(2)}` : null,
    tax: `$${tax.toFixed(2)}`,
    tip: order.tip ? `$${order.tip.toFixed(2)}` : null,
    total: `$${order.total.toFixed(2)}`,
  });
};