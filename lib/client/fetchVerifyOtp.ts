import { request } from "lib/client/request";
import type { FetchVerifyOtp, VerifyOtpRequestBody } from "types";

export const fetchVerifyOtp: FetchVerifyOtp = async (phoneNumber, code) => {
  const body: VerifyOtpRequestBody = {
    code,
    phoneNumber,
  };

  return await request("/api/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};
