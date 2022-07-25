export interface VerifyOtpResult {
  otpValid: boolean;
}

export type FetchVerifyOtp = (
  phoneNumber: string,
  code: string
) => Promise<VerifyOtpResult>;

export interface VerifyOtpRequestBody {
  code: string;
  phoneNumber: string;
}
