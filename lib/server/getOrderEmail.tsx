import type React from "react";
import ReactDomServer from "react-dom/server";

import { getCartProfit } from "lib/getCartPricingBreakdown";
import { toMoney } from "lib/toMoney";
import type { Order } from "types";

const getRowBg = (index: number): React.CSSProperties => {
  if (index % 2 === 0) {
    return {};
  } else {
    return { backgroundColor: "rgba(0, 0, 0, 0.04)" };
  }
};

export const getOrderEmail = (order: Order, didAwardLoyaltyPoint = false) => {
  const profit = getCartProfit(
    order.subTotal ?? 0,
    order.tip,
    order.deliver_to.address === "PICKUP ORDER" ? "pickup" : "delivery",
    order.discount
  );

  const pStyles: React.CSSProperties = {
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  };

  const tdStyles: React.CSSProperties = {
    border: 0,
    padding: 8,
    verticalAlign: "top",
  };

  const thStyles: React.CSSProperties = { ...tdStyles, textAlign: "right" };

  const listStyles: React.CSSProperties = {
    margin: 0,
    padding: 0,
  };

  const ulStyles: React.CSSProperties = {
    ...listStyles,
    listStyle: "none",
  };

  const liStyles = {
    marginLeft: 16,
  };

  const nestedLiStyles = {
    paddingTop: 2,
    paddingBottom: 0,
  };

  let rowIndex = 1;

  return ReactDomServer.renderToStaticMarkup(
    <>
      {/* <!DOCTYPE html> */}
      <html lang="en">
        <body>
          {didAwardLoyaltyPoint ? (
            <p style={pStyles}>Customer received 1 point for this order.</p>
          ) : null}
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              margin: "0 auto",
              maxWidth: 480,
            }}
          >
            <tbody>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Name
                </th>
                <td style={tdStyles}>
                  {order.deliver_to.firstName} {order.deliver_to.lastName}
                </td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Email
                </th>
                <td style={tdStyles}>
                  <a href="mailto:${order.deliver_to.email}">
                    {order.deliver_to.email}
                  </a>
                </td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Phone
                </th>
                <td style={tdStyles}>{order.deliver_to.phoneNumber}</td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Address
                </th>
                <td style={tdStyles}>{order.deliver_to.address}</td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Restaurant
                </th>
                <td style={tdStyles}>{order.restaurant_id}</td>
              </tr>
              {order.deliver_to.appartmentNo ? (
                <tr style={getRowBg(rowIndex++)}>
                  <th style={thStyles} role="row">
                    Apartment
                  </th>
                  <td style={tdStyles}>{order.deliver_to.appartmentNo}</td>
                </tr>
              ) : null}
              {order.order_items ? (
                <tr style={getRowBg(rowIndex++)}>
                  <th style={thStyles} role="row">
                    Products
                  </th>
                  <td style={tdStyles}>
                    <ol style={listStyles}>
                      {order.order_items.map((item, itemIndex) => {
                        return (
                          <li
                            key={itemIndex}
                            style={{
                              ...liStyles,
                              marginTop: itemIndex === 0 ? 0 : 8,
                            }}
                          >
                            {item.qty} x {item.item_id}
                            {item.choices ? (
                              <ul style={ulStyles}>
                                {item.choices.map((choice, choiceIndex) => (
                                  <li
                                    style={{ ...liStyles, ...nestedLiStyles }}
                                    key={choiceIndex}
                                  >
                                    {choice.qty} x {choice.name}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {item.optionalChoices ? (
                              <ul style={ulStyles}>
                                {item.optionalChoices.map(
                                  (choice, choiceIndex) => (
                                    <li
                                      style={{ ...liStyles, ...nestedLiStyles }}
                                      key={choiceIndex}
                                    >
                                      {choice.qty} x {choice.name}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : null}
                            {item.item_description ? (
                              <b>Note: {item.item_description}</b>
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>
                  </td>
                </tr>
              ) : null}
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Drop-off preference
                </th>
                <td style={tdStyles}>{order.deliver_to.dropoff}</td>
              </tr>
              $
              {order.deliver_to.dropoff_note ? (
                <tr style={getRowBg(rowIndex++)}>
                  <th style={thStyles} role="row">
                    Drop-off note
                  </th>
                  <td style={tdStyles}>{order.deliver_to.dropoff_note}</td>
                </tr>
              ) : null}
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Tip
                </th>
                <td style={tdStyles}>${order.tip}</td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Subtotal
                </th>
                <td style={tdStyles}>${order.subTotal}</td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Discount
                </th>
                <td style={tdStyles}>${order.discount ?? 0}</td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Profit
                </th>
                <td style={tdStyles}>${toMoney(profit)}</td>
              </tr>
              <tr style={getRowBg(rowIndex++)}>
                <th style={thStyles} role="row">
                  Total
                </th>
                <td style={tdStyles}>${order.total}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    </>
  );
};