import { captureException, flush, withSentry } from "@sentry/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { db } from "lib/server/db";
import type {
  ApiErrorResponse,
  UserForVerification,
  VerifyOtpResult,
} from "types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyOtpResult | ApiErrorResponse>
) {
  let phoneNumber: string =
    typeof req.body.phoneNumber === "string" ? req.body.phoneNumber : null;
  const code: string = typeof req.body.code === "string" ? req.body.code : null;

  if (!phoneNumber) {
    return res
      .status(400)
      .json(
        createApiErrorResponse("Missing `phoneNumber` property in request body")
      );
  }

  if (!code) {
    return res
      .status(400)
      .json(createApiErrorResponse("Missing `code` property in request body"));
  }

  phoneNumber = getTenDigitPhoneNumber(phoneNumber);

  if (phoneNumber.length !== 10) {
    return res
      .status(400)
      .json(createApiErrorResponse("Phone number is invalid."));
  }

  try {
    const userForVerificationDoc = await getDoc(
      doc(db, "users_for_verification", phoneNumber)
    );

    if (!userForVerificationDoc.exists()) {
      return res
        .status(400)
        .json(
          createApiErrorResponse(
            `No verification code requested for ${phoneNumber}.`
          )
        );
    }

    const userForVerification =
      userForVerificationDoc.data() as UserForVerification;

    if (userForVerification.code !== parseInt(code)) {
      return res
        .status(400)
        .json(createApiErrorResponse(`Verification code invalid.`));
    }

    await setDoc(
      doc(db, "users_for_verification", phoneNumber),
      {
        code: null,
        otpExpiredAt: null,
        otpVerified: true,
      },
      { merge: true }
    );
  } catch (err) {
    captureException(err);

    await flush(2000);

    return res.status(500).json(createApiErrorResponse(err));
  }

  return res.status(200).json({ otpValid: true });
}

export default withSentry(handler);
