import { getCartFees } from "lib/getCartPricingBreakdown";
import { Choice, Order, OrderItem } from "types";

const getChoices = (choices?: Array<Choice>) => {
  const html = choices?.reduce((acc, choice) => {
    return acc + `<li>${choice.qty} x ${choice.name}</li>`;
  }, "");

  return html;
};

const getProducts = (products?: Array<OrderItem>) => {
  const html = products?.reduce((acc, product) => {
    return (
      acc +
      `<li>
        ${product.qty} x ${product.item_id}
        <ul style="list-style: none; padding: 0;">
          ${getChoices(product.choices)}
        </ul>
        <ul style="list-style: none; padding: 0;">
          ${getChoices(product.optionalChoices)}
        </ul>
        <b>Note: ${product.item_description || "N/A"}</b>
      </li>`
    );
  }, "");

  return html;
};

export const getOrderEmail = (order: Order) => {
  const { deliveryFee, processingFee, serviceFee, smallOrderFee } = getCartFees(
    order.subTotal ?? 0,
    order.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery"
  );

  const profit =
    deliveryFee + processingFee + serviceFee + smallOrderFee + order.tip;

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 0 auto;
          max-width: 480px;
        }
        th,
        td {
          border: 1px solid #000000;
          padding: 10px;
        }
        ul {
          margin: 0px;
          padding-left: 14px;
        }
        ul li {
          padding-bottom: 20px;
        }
        ul li ul li {
          padding-top: 2px;
          padding-bottom: 0px;
        }
        ul li:last-child {
          padding-bottom: 0px;
        }
      </style>
    </head>
    <body>
      <table>
        <tbody>
          <tr>
            <th role="row">Customer Name</th>
            <td>${order.deliver_to.firstName} ${order.deliver_to.lastName}</td>
          </tr>
          <tr>
            <th role="row">Customer Email</th>
            <td>
              <a href="mailto:${order.deliver_to.email}">
                ${order.deliver_to.email}
              </a>
            </td>
          </tr>
          <tr>
            <th role="row">Customer Mobile</th>
            <td>${order.deliver_to.phoneNumber}</td>
          </tr>
          <tr>
            <th role="row">Customer Address</th>
            <td>${order.deliver_to.address}</td>
          </tr>
          <tr>
            <th role="row">Restaurant Name</th>
            <td>${order.restaurant_id}</td>
          </tr>
          <tr>
            <th role="row">Products</th>
            <td>
              <ul>
                ${getProducts(order.order_items)}
              </ul>
            </td>
          </tr>
          <tr>
            <th role="row">Apartment Number</th>
            <td>
              ${
                order.deliver_to.appartmentNo
                  ? order.deliver_to.appartmentNo
                  : "N/A"
              }
            </td>
          </tr>
          <tr>
            <th role="row">Drop-off note</th>
            <td>
              ${
                order.deliver_to.dropoff_note === ""
                  ? "N/A"
                  : order.deliver_to.dropoff_note
              }
            </td>
          </tr>

          <tr>
            <th role="row">Drop-off preference</th>
            <td>${order.deliver_to.dropoff}</td>
          </tr>

          <tr>
            <th role="row">Tip</th>
            <td>$${order.tip}</td>
          </tr>

          <tr>
            <th role="row">SubTotal Amount</th>
            <td>$${order.subTotal}</td>
          </tr>

          <tr>
            <th role="row">Profit</th>
            <td>$${profit}</td>
          </tr>

          <tr>
            <th role="row">Total Amount</th>
            <td>$${order.total}</td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
`;
};
