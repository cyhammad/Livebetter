import { captureException, flush, withSentry } from "@sentry/nextjs";
import { doc, getDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { db } from "lib/server/db";
import type {
  ApiErrorResponse,
  ApiUserWithLoyaltyProgram,
  UserWithLoyaltyProgram,
} from "types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { user: ApiUserWithLoyaltyProgram | null } | ApiErrorResponse
  >
) {
  const phoneNumber =
    typeof req.query.phoneNumber === "string"
      ? getTenDigitPhoneNumber(req.query.phoneNumber)
      : undefined;
  const restaurantName =
    typeof req.query.restaurantName === "string"
      ? req.query.restaurantName
      : undefined;

  try {
    const userWithLoyaltyProgramDoc = await getDoc(
      doc(db, "users-with-loyalty-program", `${phoneNumber}-${restaurantName}`)
    );

    const userWithLoyaltyProgram =
      userWithLoyaltyProgramDoc.data() as UserWithLoyaltyProgram | null;

    if (!userWithLoyaltyProgram) {
      res.status(200).json({ user: null });

      return;
    }

    const result: ApiUserWithLoyaltyProgram = {
      ...userWithLoyaltyProgram,
      created_at: userWithLoyaltyProgram.created_at.toDate().toJSON(),
    };

    res.status(200).json({ user: result });
  } catch (err) {
    captureException(err);

    await flush(2000);

    res.status(500).json(createApiErrorResponse(err));
  }
}

export default withSentry(handler);
