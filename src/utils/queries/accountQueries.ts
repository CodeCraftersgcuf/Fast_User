import axios from "axios";
import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "@/apiConfig";

export const getUserProfile = async (
  token: string
): Promise<IUserProfileResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetUserProfileData,
    "GET",
    undefined,
    token
  );
};

export const getKycStatus = async (
  token: string
): Promise<IUserKycResponse> => {
  console.log("🔹 Sending KYC Status Request", token);
  return await apiCall(
    API_ENDPOINTS.USER.GetKycStatus,
    "GET",
    undefined,
    token
  );
};

export const getTickets = async (token: string): Promise<ITicketsResponse> =>
  await apiCall(API_ENDPOINTS.USER.GetTickets, "GET", undefined, token);

export const getUnreadNotifications = async (
  token: string
): Promise<INotificationsResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetNotifications,
    "GET",
    undefined,
    token
  );
};
export const getSingleTicket = async (
  token: string,
  ticketId: number
): Promise<ITicketsResponse> => {
  return await apiCall(
    `${API_ENDPOINTS.USER.GetSingleTicket}/${ticketId}`,  // Append ticketId dynamically
    "GET",
    undefined,
    token
  );
};


export const markAllRead = async (token: string) => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.markAllNotificationsAsRead,
    "GET",
    undefined,
    token
  );
};

export const checkBvnStatus = async (
  token: string
): Promise<{ status: "active" | "pending" }> => {
  return await apiCall(
    API_ENDPOINTS.AUTH.CheckBvnStatus,
    "GET",
    undefined,
    token
  );
};
export const verifyBvnStatus = async (
  token: string
): Promise<{ status: "checked" | "unchecked" }> => {
  return await apiCall(
    API_ENDPOINTS.AUTH.CheckBvnVerified,
    "GET",
    undefined,
    token
  );
};

export const getBillPaymentHistory = async (
  token: string
): Promise<IBillTransactionResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetBillPaymentHistory,
    "GET",
    undefined,
    token
  );
};
export const getTransferHistory = async (
  token: string
): Promise<ITransferTransactionResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetTransferHistory,
    "GET",
    undefined,
    token
  );
};
export const generateBvnLinkAgain = async ({ token }: { token: string }) => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.RequestBvnConsent,
    "POST",
    undefined,
    token
  );
};

export const getFundAccountNo = async (
  token: string
): Promise<IFundAccResponse> => {
  return await apiCall(
    API_ENDPOINTS.MONEY_TRANSFER.GetFundAccountNo,
    "GET",
    undefined,
    token
  );
};

export const getBalance = async (token: string): Promise<IBalanceResposne> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetBalance,
    "GET",
    undefined,
    token
  );
};

export const getMonthlyStats = async (
  token: string
): Promise<IStatsResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetMonthlyStats,
    "GET",
    undefined,
    token
  );
};

export const getYearlyStats = async (
  token: string
): Promise<IStatsResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetYearlyStats,
    "GET",
    undefined,
    token
  );
};

export const getQuarterlyStats = async (
  token: string
): Promise<IStatsResponse> => {
  return await apiCall(
    API_ENDPOINTS.ACCOUNT_MANAGEMENT.GetQuarterlyStats,
    "GET",
    undefined,
    token
  );
};

interface IStatsResponse {
  status: string;
  data: IStats[];
}

export interface IStats {
  name: string;
  expense: number;
}

interface IBalanceResposne {
  status: string;
  balance: number;
  totalIncome: number;
  totalBillPayment: number;
  unreadNotification?: number;
}

interface IUserProfileResponse {
  status: string;
  data: IUserProfileData;
}
interface IUserKycResponse {
  status: string;
  data: {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    address: string;
    state: string;
    dob: string;
    bvn: string;
    document_type: string;
    document_number: string;
    picture: string;
    document_front: string;
    document_back: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

interface IReply {
  id: number;
  ticket_id: number;
  message: string;
  attachment: string | null;
  sender_type: string;
  created_at: string;
  updated_at: string;
}

interface ITicket {
  id: number;
  user_id: number;
  subject: string;
  issue: string;
  status: string;
  answered: string;
  created_at: string;
  updated_at: string;
  replies?: IReply[]; // ✅ Make replies optional
}

interface ITicketsResponse {
  status: string;
  data: ITicket;
  message: string;
}


export interface IUserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  profilPicture: string | null;
  gender: string | null;
  occupation: string | null;
  dob: string | null;
  email: string;
}

interface User {
  id: number;
  email: string;
  email_verified_at: string | null;
  otp: string | null;
  otp_verified: number;
  created_at: string;
  updated_at: string;
}

interface INotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  read: number;
  created_at: string;
  updated_at: string;
  icon: string;
  iconColor: string;
}
interface INotificationsResponse {
  status: string;
  message: string;
  data: INotification[];
}

export type ITrasnferTransaction = {
  transaction_id: number;
  amount: string;
  totalAmount: string;
  category: string;
  item: string;
  logo: string;
  type: string;
  date: string; // ISO date format
  status: "Completed" | "Pending" | "Failed";
};
// export type ITrasnferTransaction = {
//   transaction_id: number;
//   amount: string;
//   user_id: number;
//   transaction_type: 'inter' | 'intra';
//   transaction_date: string; // ISO date format
//   sign: 'negative' | 'positive';
//   status: 'Completed' | 'Pending' | 'Failed'; // Expandable if there are more statuses
//   from_account_number: string;
//   to_account_number: string;
//   from_client_id: string;
//   to_client_id: string;
//   to_client_name: string;
//   from_client_name: string;
//   response_message: string | null;
//   type: string | null;
// };

type ITransferTransactionResponse = {
  status: "success" | "error";
  data: ITrasnferTransaction[];
};

export interface IBillTransaction {
  id: number;
  amount: string;
  user_id: number;
  transaction_type: string;
  transaction_date: string;
  refference: string;
  customerId: string;
  sign: "negative" | "positive";
  status: "completed" | "pending" | "failed"; // Add more statuses if applicable
  category: string;
  paymentitemname: string;
  billerType: string;
  payDirectitemCode: string;
  currencyCode: string;
  division: string;
  created_at: string; // ISO date format
  billerId: string;
  category_icon: string;
  iconColor: string; // RGBA format
}

interface IBillTransactionResponse {
  status: "success" | "error";
  data: IBillTransaction[];
}

interface IFundAccResponse {
  status: "success" | "error";
  message: string;
  data: AccData;
}

interface AccData {
  accountNumber: string;
  expiryDate: string;
}
