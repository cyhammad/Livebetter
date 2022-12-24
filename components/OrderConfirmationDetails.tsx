import { captureException } from "@sentry/nextjs";
import { useStripe } from "@stripe/react-stripe-js";
import { addMinutes, format } from "date-fns";
import { useEffect, useState } from "react";

import { OrderChoicesList } from "components/OrderChoicesList";
import { useCartContext } from "hooks/useCartContext";
import { getCartFees } from "lib/getCartPricingBreakdown";
import { getDeliveryTimeLabel } from "lib/getDeliveryTimeLabel";
import { getOrderMenuItemTotal } from "lib/getOrderMenuItemTotal";
import type { ApiOrder, ShippingMethod } from "types";

interface OrderConfirmationDetailsProps {
  order: ApiOrder;
}

export const OrderConfirmationDetails = ({
  order,
}: OrderConfirmationDetailsProps) => {
  return <div>THIS IS ORDER CONFIRMATION PAGE {order.charges_id}</div>;
};

// export const OrderConfirmationDetails = ({
//   order,
// }: OrderConfirmationDetailsProps) => {
//   const stripe = useStripe();
//   const [paymentMessage, setPaymentMessage] = useState<string>();
//   const { cart, emptyCart } = useCartContext();

//   useEffect(() => {
//     if (!stripe) {
//       return;
//     }

//     const clientSecret = new URLSearchParams(window.location.search).get(
//       "payment_intent_client_secret"
//     );

//     if (!clientSecret) {
//       return;
//     }

//     stripe
//       .retrievePaymentIntent(clientSecret)
//       .then(({ paymentIntent }) => {
//         switch (paymentIntent?.status) {
//           case "succeeded":
//             if (cart?.restaurant.Shipday) {
//               const myHeaders = new Headers();
//               myHeaders.append(
//                 "Authorization",
//                 "Basic nsVaSmjKXw.WAG4PMbcIVmTuY6DGDBa"
//               );
//               myHeaders.append("Content-Type", "application/json");

//               const raw = JSON.stringify({
//                 orderNumber: order.charges_id,
//                 customerName:
//                   order.deliver_to.firstName + " " + order.deliver_to.lastName,
//                 customerAddress: order.deliver_to.address,
//                 customerEmail: order.deliver_to.email,
//                 customerPhoneNumber: order.deliver_to.phoneNumber,
//                 restaurantName: order.restaurant_id,
//                 restaurantAddress: cart?.restaurant.Address,
//                 restaurantPhoneNumber: cart?.restaurant.Phone,
//                 expectedDeliveryDate: format(new Date(), "yyyy-MM-dd"),
//                 expectedPickupTime: format(new Date(), "hh:mm:ss"),
//                 expectedDeliveryTime: format(
//                   addMinutes(new Date(), 30),
//                   "HH:mm:ss"
//                 ),
//                 pickupLatitude: cart?.restaurant.Latitude,
//                 pickupLongitude: cart?.restaurant.Longitude,
//                 deliveryLatitude: order.deliver_to.customerLocation?.lat,
//                 deliveryLongitude: order.deliver_to.customerLocation?.lng,
//                 tips: order.tip,
//                 tax: order.tax,
//                 discountAmount: order.discount,
//                 deliveryFee: order.deliveryFee,
//                 totalOrderCost: order.total,
//                 deliveryInstruction: order.deliver_to.dropoff_note,
//                 orderSource: "Seamless",
//                 additionalId: "4532",
//                 clientRestaurantId: 12,
//                 paymentMethod: "credit_card",
//                 creditCardType: "visa",
//                 creditCardId: 965,
//                 readyToPickup: true,
//               });

//               const requestOptions: RequestInit = {
//                 method: "POST",
//                 headers: myHeaders,
//                 body: raw,
//                 redirect: "follow",
//               };
//               fetch("https://api.shipday.com/orders", requestOptions)
//                 .then((response) => {
//                   setPaymentMessage(
//                     "Order assigned to Shipday " + response.status
//                   );
//                 })
//                 .then((result) => {
//                   setPaymentMessage("Order assigned to Shipday" + result);
//                 })
//                 .catch((error) => {
//                   setPaymentMessage(
//                     "Order could not be assigned to Shipday" + error
//                   );
//                 });
//             } else {
//               setPaymentMessage("Payment succeeded!");
//             }

//             // Check if our current cart's client secret matches the client secret
//             // for this order. If it does, that means the user was just redirected
//             // here from a successful order (vs just viewing this order later), so
//             // we should clear their cart.
//             if (cart?.paymentIntentClientSecret === clientSecret) {
//               emptyCart();
//             }

//             break;
//           case "processing":
//             setPaymentMessage("Your payment is processing.");

//             break;
//           case "requires_payment_method":
//             setPaymentMessage(
//               "Your payment was not successful, please try again."
//             );

//             break;
//           default:
//             setPaymentMessage("Something went wrong.");

//             break;
//         }
//       })
//       .catch((err) => {
//         captureException(err, {
//           extra: { message: "Failed to retrieve payment intent", clientSecret },
//         });
//         setPaymentMessage("Something went wrong.");
//       });
//   }, [
//     cart?.paymentIntentClientSecret,
//     cart?.restaurant.Address,
//     cart?.restaurant.Latitude,
//     cart?.restaurant.Longitude,
//     cart?.restaurant.Phone,
//     cart?.restaurant.Shipday,
//     emptyCart,
//     order.charges_id,
//     order.deliver_to.address,
//     order.deliver_to.customerLocation?.lat,
//     order.deliver_to.customerLocation?.lng,
//     order.deliver_to.dropoff_note,
//     order.deliver_to.email,
//     order.deliver_to.firstName,
//     order.deliver_to.lastName,
//     order.deliver_to.phoneNumber,
//     order.deliveryFee,
//     order.discount,
//     order.restaurant_id,
//     order.tax,
//     order.tip,
//     order.total,
//     stripe,
//   ]);

//   const shippingMethod: ShippingMethod =
//     order?.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery";

//   let tax, deliveryFee, processingFee, serviceFee, smallOrderFee;

//   // Checking order.tax is a cheap way of figuring out if all fees will be on
//   // the order document. `tax`, `deliveryFee`, `processingFee`, `serviceFee`,
//   // and `smallOrderFee` were all added to the Order document at the same time
//   if (order.tax) {
//     tax = order.tax;
//     deliveryFee = order.deliveryFee;
//     processingFee = order.processingFee;
//     serviceFee = order.serviceFee;
//     smallOrderFee = order.smallOrderFee;
//   } else {
//     const fees = getCartFees(
//       order?.subTotal ?? 0,
//       shippingMethod,
//       order?.distance ?? 1,
//       order?.discount
//     );

//     tax = fees.tax;
//     deliveryFee = fees.deliveryFee;
//     processingFee = fees.processingFee;
//     serviceFee = fees.serviceFee;
//     smallOrderFee = fees.smallOrderFee;
//   }

//   return (
//     <div className="flex flex-col gap-6">
//       {order ? (
//         <>
//           <section className="px-4 sm:px-6 flex flex-col gap-4">
//             {shippingMethod === "delivery" ? (
//               <>
//                 <h3 className="text-xl font-bold underline">Delivery to</h3>
//                 <div>
//                   <p>
//                     {order.deliver_to.firstName} {order.deliver_to.lastName}
//                   </p>
//                   <p>
//                     {order.deliver_to.address}
//                     {order.deliver_to.appartmentNo
//                       ? ` (${order.deliver_to.appartmentNo})`
//                       : null}
//                   </p>
//                   {order.waitTime ? (
//                     <>
//                       <p>
//                         <b className="font-medium">Estimated Delivery Time:</b>{" "}
//                         {getDeliveryTimeLabel(
//                           order.waitTime,
//                           new Date(order.created_at)
//                         )}
//                         <br />
//                         <small>* Delivery times are not guaranteed.</small>
//                       </p>
//                     </>
//                   ) : null}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <h3 className="text-xl font-bold underline">Pick-up for</h3>
//                 <div>
//                   <p>
//                     {order.deliver_to.firstName} {order.deliver_to.lastName}
//                   </p>
//                 </div>
//               </>
//             )}
//           </section>
//           <section className="px-4 sm:px-6 flex flex-col gap-4">
//             <h3 className="text-xl font-bold underline">Order details</h3>
//             <ul className="flex flex-col gap-4">
//               {order.order_items.map((item, index) => (
//                 <li className="flex gap-2 items-center" key={index}>
//                   <span className="flex-none font-bold">{item.qty} ×</span>
//                   <div className="flex flex-col gap-0 w-full">
//                     <p
//                       className="grid justify-between items-start line-clamp-1"
//                       style={{ gridTemplateColumns: "1fr auto auto" }}
//                     >
//                       {item.item_id}
//                     </p>
//                     <OrderChoicesList choices={item.choices} />
//                     <OrderChoicesList choices={item.optionalChoices} />
//                     {item.item_description ? (
//                       <p className="text-sm text-gray-600 ml-4">
//                         Notes: {item.item_description}
//                       </p>
//                     ) : null}
//                   </div>
//                   <div className="flex gap-1">
//                     <span className="min-w-[60px] text-right tabular-nums">
//                       $
//                       {getOrderMenuItemTotal(
//                         item.item_price ?? 0,
//                         item.qty,
//                         item.choices,
//                         item.optionalChoices
//                       ).toFixed(2)}
//                     </span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//             <p className="text-right tabular-nums flex justify-between">
//               <b>Subtotal:</b>{" "}
//               <b className="font-semibold">${order.subTotal?.toFixed(2)}</b>
//             </p>
//             {order.discount ?? 0 > 0 ? (
//               <p className="text-right tabular-nums flex justify-between">
//                 <b>Discount:</b>{" "}
//                 <b className="font-semibold text-emerald-600">
//                   -${order.discount?.toFixed(2)}
//                 </b>
//               </p>
//             ) : null}
//             <div className="flex flex-col gap-0">
//               {serviceFee ? (
//                 <p className="text-sm text-right tabular-nums flex justify-between">
//                   <span>Service fee:</span> ${serviceFee.toFixed(2)}
//                 </p>
//               ) : null}
//               {smallOrderFee ? (
//                 <p className="text-sm text-right tabular-nums flex justify-between">
//                   <span>Small order fee:</span> ${smallOrderFee.toFixed(2)}
//                 </p>
//               ) : null}
//               {deliveryFee ? (
//                 <p className="text-sm text-right tabular-nums flex justify-between">
//                   <span>Delivery fee:</span> ${deliveryFee.toFixed(2)}
//                 </p>
//               ) : null}
//               {processingFee ? (
//                 <p className="text-sm text-right tabular-nums flex justify-between">
//                   <span>Processing fee:</span> ${processingFee.toFixed(2)}
//                 </p>
//               ) : null}
//               <p className="text-sm text-right tabular-nums flex justify-between">
//                 <span>Tax:</span> ${tax.toFixed(2)}
//               </p>
//             </div>
//             <p className="text-right tabular-nums flex justify-between">
//               <b>Tip:</b>{" "}
//               <b className="font-semibold">${order.tip?.toFixed(2)}</b>
//             </p>
//             <p className="text-right tabular-nums flex justify-between">
//               <b>Total:</b>{" "}
//               <b className="font-semibold">${order.total.toFixed(2)}</b>
//             </p>
//             <p>{paymentMessage}</p>
//           </section>
//         </>
//       ) : null}
//     </div>
//   );
// };
