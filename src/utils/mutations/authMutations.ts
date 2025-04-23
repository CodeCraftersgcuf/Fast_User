import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../../apiConfig";

export const loginUser = async (data: {}): Promise<IUserLoginResponse> => {
  console.log("🔹 Sending Login Request:", data); // ✅ Log request before sending
  return await apiCall(API_ENDPOINTS.AUTH.Login, "POST", data);
};

export const signUpUser = async (data: {}): Promise<any> => {
  console.log("🔹 Sending Register Request:", data); // ✅ Log request before sending
  return await apiCall(API_ENDPOINTS.AUTH.Register, "POST", data);
};

export const verifyEmailOTP = async (data: { otp: string; email: string }) => {
  return await apiCall(API_ENDPOINTS.AUTH.VerfiyEmailOtp, "POST", data);
};

export const resendOtp = async ({ data }: { data: { email: string } }) => {
  return await apiCall(API_ENDPOINTS.AUTH.ResendOtp, "POST", data);
};

export const riderVerification1 = async ({
  data,
  token,
}: {
  data: {
    email_address: string; // Adjusted from email to email_address
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    nin_number: string;
  };
  token: string;
}) => {
  // Ensure you're passing the data correctly with the expected properties
  return await apiCall(
    API_ENDPOINTS.AUTH.VerificationStep1,
    "POST",
    data,
    token
  );
};

export const riderVerification2 = async ({
  data,
  token,
}: {
  data: {
    vehicle_type: string; // Adjusted from email to email_address
    plate_number: string;
    riders_permit_number: string;
    color: string;
  };
  token: string;
}) => {
  // Ensure you're passing the data correctly with the expected properties
  return await apiCall(
    API_ENDPOINTS.AUTH.VerificationStep2,
    "POST",
    data,
    token
  );
};



export const setPin = async (data: { email: string; pin: string }) => {
  return await apiCall(API_ENDPOINTS.USER.SetPin, "POST", data);
};

export const verifyPin = async (data: { email: string; pin: string }) => {
  return await apiCall(API_ENDPOINTS.USER.VerifyPin, "POST", data);
};

export const forgotPassword = async (data: { email: string }) => {
  return await apiCall(API_ENDPOINTS.AUTH.ForgotPassword, "POST", data);
};

export const verifyPasswordOTP = async (data: {
  otp: string;
  email: string;
}) => {
  console.log("🔹 Sending Login Request:", data);
  return await apiCall(API_ENDPOINTS.AUTH.VerifyPasswordOtp, "POST", data);
};

export const resetPassword = async (data: {
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  return await apiCall(API_ENDPOINTS.AUTH.ResetPassword, "POST", data);
};

export interface IUserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture: string;
  created_at: string;
  updated_at: string;
}

export interface IUserProfiles {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  otp: string;
  profile_picture: string | null;
  phone: string;
  otp_verified: number;
  is_active: number;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface IUserLoginResponse {
  status: string;
  data: {
    user: IUserProfiles;
    token: string;
  };
  message: string;
}
