import { API_ENDPOINTS } from "../../../apiConfig";
// import { IClientCreation } from '@/app/fillyourprofile';
// import { ICooperateClient } from '@/app/createcoroporateaccount';
import { apiCall } from "../customApiCall";

export const changePassword = async ({
  data,
  token,
}: {
  data: { oldPassword: string; newPassword: string }; // Frontend field names
  token: string;
}) => {
  console.log("🔹 Original Change Password Data:", data);

  // Map the frontend data to the backend expected format
  const mappedData = {
    old_password: data.oldPassword, // Map oldPassword to old_password
    new_password: data.newPassword, // Map newPassword to new_password
  };

  console.log("🔹 Mapped Change Password Data:", mappedData);

  // Make the API call with the mapped data
  return await apiCall(
    API_ENDPOINTS.USER.ChangePassword,
    "POST",
    mappedData,
    token
  );
};

export const createInternalTransfer = async ({
  data,
  token,
}: {
  data: {
    currency: string;
    network: string;
    amount: string;
    email: string;
  };
  token: string;
}) => {
  console.log("🔹 Original Create Internal Transfer Data:", data);
  return await apiCall(
    API_ENDPOINTS.USER.SendInternalTransfer,
    "POST",
    data,
    token
  );
};

export const createBuy = async ({
  data,
  token,
}: {
  data: {
    currency: string;
    network: string;
    amount_coin: string;
    amount_usd: string;
    amount_naira: string;
    bank_account_id: string;
  };
  token: string;
}) => {
  return await apiCall(API_ENDPOINTS.USER.BuyTransfter, "POST", data, token);
};
export const createSwap = async ({
  data,
  token,
}: {
  data: {
    currency: string;
    network: string;
    amount: string;
    exchange_rate: string;
  };
  token: string;
}) => {
  return await apiCall(API_ENDPOINTS.USER.SwapTransfter, "POST", data, token);
};

export const calculateExchangeRate = async ({
  data,
  token,
}: {
  data: {
    currency: string;
    amount: string;
  };
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.USER.CalculateExchangeRate,
    "POST",
    data,
    token
  );
};

export const createKycRequest = async ({
  data,
  token,
}: {
  data: FormData;
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.USER.CreatekycRequest,
    "POST",
    data,
    token
  );
};

export const createSupportTicket = async ({
  data,
  token,
}: {
  data: FormData;
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.USER.CreateSupportTicket,
    "POST",
    data,
    token
  );
};

export const createReplyTicket = async ({
  data,
  token,
}: {
  data: {
    ticket_id: string;
    message: string;
  };
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.USER.CreateReplyTicket,
    "POST",
    data,
    token
  );
};

export const editProfile = async ({
  data,
  token,
}: {
  data: {
    name: string;
    phone: string;
  };
  token: string;
}) => {
  return await apiCall(API_ENDPOINTS.USER.EditProfile, "POST", data, token);
};

export const createIndividualAccount = async ({
  data,
  token,
}: {
  data: FormData;
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.CreateIndividualAccount,
    "POST",
    data,
    token
  );
};

export const createCooperateAccount = async ({
  data,
  token,
}: {
  data: FormData;
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.CreateCoorporateAccount,
    "POST",
    data,
    token
  );
};

export const updatePassword = async ({
  data,
  token,
}: {
  data: IUpdatePassword;
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.UpdatePassword,
    "POST",
    data,
    token
  );
};

export const updateProfile = async ({
  data,
  token,
}: {
  data: FormData;
  token: string;
}): Promise<IUpdateProfileResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.UpdateProfile,
    "POST",
    data,
    token
  );
};

export const paymentProof = async ({
  data,
  id,
  token,
}: {
  data: FormData;
  token: string;
}) => {
  return await apiCall(
    `${API_ENDPOINTS.ACCOUNT_MANAGEMENT.PaymentProof}/${id}`,
    "POST",
    data,
    token
  );
};

export const storeBankDetails = async ({
  data,
  token,
}: {
  data: {
    account_number: string;
    account_name: string;
    bank_name: string;
    is_default: any;
  };
  token: string;
}) => {
  return await apiCall(
    API_ENDPOINTS.USER.StoreBankDetails,
    "POST",
    data,
    token
  );
};

export const updateBankDetails = async ({
  data,
  token,
}: {
  data: {
    id: string;
    account_number: string;
    account_name: string;
    bank_name: string;
    is_default: any;
  };
  token: string;
}) => {
  // Use data.id instead of id
  return await apiCall(
    `${API_ENDPOINTS.USER.UpdateBankDetails}/${data.id}`, // Access data.id here
    "PUT",
    data,
    token
  );
};
export const deleteBankDetail = async ({
  data,
  token,
}: {
  data: { id: string };
  token: string;
}) => {
  return await apiCall(
    `${API_ENDPOINTS.USER.DeleteBankAccount}/${data.id}`,
    "DELETE",
    data,
    token
  );
};

// export const updateEmail = async({})
export const validateCustomer = async ({
  data,
  token,
}: {
  data: { customerId: string; id: string };
  token: string;
}): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.BILL_MANAGEMENT.ValidateCustomer,
    "POST",
    data,
    token
  );
};

export const payBillFn = async ({
  data,
  token,
}: {
  data: IPayBill;
  token: string;
}): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.BILL_MANAGEMENT.PayBills,
    "POST",
    data,
    token
  );
};

export interface IPayBill {
  billerId: string;
  amount: string;
  customerId: string;
  billerItemId: string;
  phoneNumber: string;
  totaltAmount?: string;
  // paymentMethod: string;
}

interface IUpdatePassword {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

interface IUpdateProfileResponse {
  data: {
    accountBalance: string;
    accountId: string;
    account_number: string;
    account_type: string;
    bvn: string;
    client: string;
    clientId: string;
    created_at: string; // ISO date string
    firstName: string;
    gender: string;
    id: number;
    lastName: string;
    nickName: string | null;
    occupation: string | null;
    phone: string;
    profile_picture: string;
    savingsProductName: string;
    status: string;
    updated_at: string; // ISO date string
    user_id: number;
  };
  message: string;
}

// interface IUpdateProfileRequest {
//   firstName?: string;
//   lastName?: string;
//   phone?: string;
//   gender?: string | null;
//   occupation?: string;
//   dob?: string; // Date in ISO format (e.g., "1990-01-01")
//   profilePicture?: string | null;
// }
