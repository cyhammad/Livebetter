import { request } from "lib/client/request";
import type { CreateOtpRequestBody, FetchCreateOtp } from "types";

export const fetchCreateOtp: FetchCreateOtp = async (
  firstName,
  lastName,
  email,
  phoneNumber
) => {
  const body: CreateOtpRequestBody = {
    firstName,
    lastName,
    email,
    phoneNumber,
  };

  return await request("/api/create-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};
