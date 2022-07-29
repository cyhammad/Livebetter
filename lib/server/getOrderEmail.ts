import { getCartProfit } from "lib/getCartPricingBreakdown";
import { toMoney } from "lib/toMoney";
import { Choice, Order, OrderItem } from "types";

const getChoices = (choices?: Array<Choice>) => {
  const html = choices?.reduce((acc, choice) => {
    return acc + `<li>${choice.qty} x ${choice.name}</li>`;
  }, "");

  return html;
};

const getProducts = (products?: Array<OrderItem>) => {
  const html = products?.reduce((acc, product, index) => {
    return (
      acc +
      `<li style="${index !== 0 ? "margin-top: 8px;" : ""}">
        ${product.qty} x ${product.item_id}
        <ul style="list-style: none; padding: 0;">
          ${getChoices(product.choices)}
        </ul>
        <ul style="list-style: none; padding: 0;">
          ${getChoices(product.optionalChoices)}
        </ul>
        ${
          product.item_description
            ? `<b>Note: ${product.item_description}</b>`
            : ""
        }
      </li>`
    );
  }, "");

  return html;
};

const getRowBg = (index: number) => {
  if (index % 2 === 0) {
    return "";
  } else {
    return "background-color: rgba(0, 0, 0, 0.04);";
  }
};

export const getOrderEmail = (order: Order, didAwardLoyaltyPoint = false) => {
  const profit = getCartProfit(
    order.subTotal ?? 0,
    order.tip,
    order.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery",
    order.discount
  );

  let index = 1;

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
        th { text-align: right; }
        th,
        td {
          border: 0;
          padding: 8px;
          vertical-align: top;
        }
        ul, ol {
          margin: 0px;
          padding-left: 0;
        }
        li {
          margin-left: 16px;
        }
        ol li ul li {
          padding-top: 2px;
          padding-bottom: 0px;
        }
        ul li:last-child {
          padding-bottom: 0px;
        }
      </style>
    </head>
    <body>
      ${
        didAwardLoyaltyPoint
          ? `
            <p style="font-weight: 700; margin-bottom: 8px; text-align: center;">
              Customer received 1 point for this order.
            </p>
          `
          : ""
      }
      <table>
        <tbody>
          <tr style="${getRowBg(index++)}">
            <th role="row">Name</th>
            <td>${order.deliver_to.firstName} ${order.deliver_to.lastName}</td>
          </tr>
          <tr style="${getRowBg(index++)}">
            <th role="row">Email</th>
            <td>
              <a href="mailto:${order.deliver_to.email}">
                ${order.deliver_to.email}
              </a>
            </td>
          </tr>
          <tr style="${getRowBg(index++)}">
            <th role="row">Phone</th>
            <td>${order.deliver_to.phoneNumber}</td>
          </tr>
          <tr style="${getRowBg(index++)}">
            <th role="row">Address</th>
            <td>
              ${order.deliver_to.address}
              ${
                order.deliver_to.appartmentNo
                  ? `<br />Apartment ${order.deliver_to.appartmentNo}`
                  : ""
              }
            </td>
          </tr>
          <tr style="${getRowBg(index++)}">
            <th role="row">Restaurant</th>
            <td>${order.restaurant_id}</td>
          </tr>
          <tr style="${getRowBg(index++)}">
            <th role="row">Products</th>
            <td>
              <ol style="padding: 0;">
                ${getProducts(order.order_items)}
              </ol>
            </td>
          </tr>
          <tr style="${getRowBg(index++)}">
            <th role="row">Drop-off preference</th>
            <td>${order.deliver_to.dropoff}</td>
          </tr>
          ${
            order.deliver_to.dropoff_note
              ? `
                <tr style="${getRowBg(index++)}">
                  <th role="row">Drop-off note</th>
                  <td>
                    ${order.deliver_to.dropoff_note}
                  </td>
                </tr>
              `
              : ""
          }

          <tr style="${getRowBg(index++)}">
            <th role="row">Tip</th>
            <td>$${order.tip}</td>
          </tr>

          <tr style="${getRowBg(index++)}">
            <th role="row">Subtotal</th>
            <td>$${order.subTotal}</td>
          </tr>

          <tr style="${getRowBg(index++)}">
            <th role="row">Discount</th>
            <td>$${order.discount ?? 0}</td>
          </tr>

          <tr style="${getRowBg(index++)}">
            <th role="row">Profit</th>
            <td>$${toMoney(profit)}</td>
          </tr>

          <tr style="${getRowBg(index++)}">
            <th role="row">Total</th>
            <td>$${order.total}</td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
`;
};
