import { captureException, flush, withSentry } from "@sentry/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
import { createApiErrorResponse } from "lib/server/createApiErrorResponse";
import { db } from "lib/server/db";
import type { ApiErrorResponse, UserForVerification } from "types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ otpRequired: boolean } | ApiErrorResponse>
) {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const code = Math.floor(1000 + Math.random() * 9000);
  // Thirty minutes from now
  const otpExpiredAt = Date.now() + 30 * 60 * 1000;
  const firstName: string =
    typeof req.body.firstName === "string" ? req.body.firstName : null;
  const lastName: string =
    typeof req.body.lastName === "string" ? req.body.lastName : null;
  const email: string =
    typeof req.body.email === "string" ? req.body.email : null;
  const phoneNumber: string | null =
    typeof req.body.phoneNumber === "string"
      ? getTenDigitPhoneNumber(req.body.phoneNumber)
      : null;

  if (!phoneNumber) {
    return res
      .status(400)
      .json(
        createApiErrorResponse("Missing `phoneNumber` property in request body")
      );
  }

  if (phoneNumber.length !== 10) {
    return res
      .status(400)
      .json(createApiErrorResponse("Phone number is invalid."));
  }

  try {
    const userForVerificationDoc = await getDoc(
      doc(db, "users_for_verification", phoneNumber)
    );

    if (userForVerificationDoc.exists()) {
      // If this user previously verified their phone number, and all their
      // personal information is the same as before, we don't require them to
      // verify again
      const prevUser = userForVerificationDoc.data() as UserForVerification;

      if (
        phoneNumber &&
        email &&
        firstName &&
        lastName &&
        prevUser.phoneNumber === phoneNumber &&
        prevUser.email === email &&
        prevUser.firstName === firstName &&
        prevUser.lastName === lastName &&
        prevUser.otpVerified
      ) {
        return res.status(200).json({ otpRequired: false });
      }
    }

    const user: UserForVerification = {
      code,
      otpExpiredAt,
      otpVerified: false,
      phoneNumber,
      firstName,
      lastName,
      email,
    };

    await setDoc(doc(db, "users_for_verification", phoneNumber), user);

    await twilioClient.messages.create({
      to: phoneNumber,
      from: "+18782313212",
      body: `${code} is your Live Better verification code.`,
    });
  } catch (err) {
    captureException(err);

    await flush(2000);

    return res.status(500).json(createApiErrorResponse(err));
  }

  return res.status(200).json({ otpRequired: true });
}

export default withSentry(handler);
