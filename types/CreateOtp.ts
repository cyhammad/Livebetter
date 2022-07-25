export interface CreateOtpResult {
  otpRequired: boolean;
}

export type FetchCreateOtp = (
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string
) => Promise<CreateOtpResult>;

export interface CreateOtpRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}
