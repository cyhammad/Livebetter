export interface UserForVerification {
  code?: number | null;
  otpExpiredAt?: number | null;
  otpVerified: boolean;
  phoneNumber: string;
  // The following properties were added to help prevent users from needing to
  // verify their phone number on every request
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}
