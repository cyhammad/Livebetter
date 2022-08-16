import ReactDomServer from "react-dom/server";

import { getTotal } from "lib/getCartPricingBreakdown";
import { roundToTwoDecimals } from "lib/roundToTwoDecimals";
import type { Order } from "types";

const getRowBg = (index: number): React.CSSProperties => {
  if (index % 2 === 0) {
    return {};
  } else {
    return { backgroundColor: "rgba(0, 0, 0, 0.04)" };
  }
};

const getOrderProfit = (order: Order) => {
  let { deliveryFee, processingFee, serviceFee, smallOrderFee, tax } = order;

  deliveryFee = deliveryFee ?? 0;
  processingFee = processingFee ?? 0;
  serviceFee = serviceFee ?? 0;
  smallOrderFee = smallOrderFee ?? 0;
  tax = tax ?? 0;

  /**
   * Stripe's fee is currently 2.9% + 30 cents, per transaction
   */
  const stripeFee = roundToTwoDecimals(
    getTotal(
      order.subTotal ?? 0,
      order.discount ?? 0,
      tax,
      order.tip,
      deliveryFee,
      processingFee,
      serviceFee,
      smallOrderFee
    ) *
      0.029 +
      0.3
  );

  return roundToTwoDecimals(
    deliveryFee +
      processingFee +
      serviceFee +
      smallOrderFee +
      order.tip -
      stripeFee
  );
};

export const getOrderEmail = (order: Order, didAwardLoyaltyPoint = false) => {
  const profit = getOrderProfit(order);

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
                <a href={`mailto:${order.deliver_to.email}`}>
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
                          {item.qty} × {item.item_id}
                          {item.choices ? (
                            <ul style={ulStyles}>
                              {item.choices.map((choice, choiceIndex) => (
                                <li
                                  style={{ ...liStyles, ...nestedLiStyles }}
                                  key={choiceIndex}
                                >
                                  {choice.qty} × {choice.name}
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
                                    {choice.qty} × {choice.name}
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
              <td style={tdStyles}>
                ${(order.tip ?? 0).toFixed(2)} (
                {(((order.tip ?? 0) / (order.subTotal ?? 1)) * 100).toFixed(2)}
                %)
              </td>
            </tr>
            <tr style={getRowBg(rowIndex++)}>
              <th style={thStyles} role="row">
                Subtotal
              </th>
              <td style={tdStyles}>${(order.subTotal ?? 0).toFixed(2)}</td>
            </tr>
            <tr style={getRowBg(rowIndex++)}>
              <th style={thStyles} role="row">
                Delivery fee
              </th>
              <td style={tdStyles}>${(order.deliveryFee ?? 0).toFixed(2)}</td>
            </tr>
            <tr style={getRowBg(rowIndex++)}>
              <th style={thStyles} role="row">
                Discount
              </th>
              <td style={tdStyles}>${(order.discount ?? 0).toFixed(2)}</td>
            </tr>
            <tr style={getRowBg(rowIndex++)}>
              <th style={thStyles} role="row">
                Profit
              </th>
              <td style={tdStyles}>${roundToTwoDecimals(profit)}</td>
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
  );
};
