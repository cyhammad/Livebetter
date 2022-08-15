import sendGridMail from "@sendgrid/mail";
import { captureException, flush, withSentry } from "@sentry/nextjs";
import { DocumentReference, doc, getDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { db } from "lib/server/db";
import { getOrderEmail } from "lib/server/getOrderEmail";
import type { ApiErrorResponse, Order } from "types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ sent: boolean } | ApiErrorResponse>
) {
  const { orderId } = req.body;

  if (!orderId) {
    return res
      .status(400)
      .json(
        createApiErrorResponse("Missing `orderId` property in request body")
      );
  }

  const orderDoc = await getDoc<Order>(
    doc(
      db,
      process.env.VERCEL_ENV === "production" ? "orders" : "__dev_orders",
      orderId
    ) as DocumentReference<Order>
  );

  if (!orderDoc || !orderDoc.exists()) {
    return res
      .status(400)
      .json(createApiErrorResponse(`Order with id "${orderId}" not found`));
  }

  sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

  const order = orderDoc.data();

  const orderEmailHtml = getOrderEmail(order);

  const [orderEmailResponse] = await Promise.allSettled([
    await sendGridMail.send({
      from: "livebetterphl@gmail.com",
      to:
        process.env.VERCEL_ENV === "production"
          ? "livebetterphl@gmail.com"
          : "testorders4@gmail.com",
      subject: `New Order Notification ✔ (Order #${orderDoc.id})`,
      html: orderEmailHtml,
      headers: { Accept: "application/json" },
    }),
  ]);

  const didOrderEmailFail = orderEmailResponse.status === "rejected";

  if (didOrderEmailFail) {
    captureException(orderEmailResponse.reason, {
      extra: {
        message: "Failed to send order email using SendGrid",
      },
    });

    await flush(2000);

    return res
      .status(500)
      .json(
        createApiErrorResponse(
          `Failed to send order email using SendGrid because: ${orderEmailResponse.reason}`
        )
      );
  }

  return res.status(200).json({ sent: true });
}

export default withSentry(handler);
