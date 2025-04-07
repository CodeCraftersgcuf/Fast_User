import axios from "axios";
import { API_ENDPOINTS } from "../../apiConfig";
import { apiCall } from "../customApiCall";

export const createWithdrawal = async ({
  data,
  token,
}: {
  data: IWithdrawalRequest;
  token: string;
}): Promise<IWithdrawalResponse> => {
  console.log("🔹 Withdrawal Requestssssss:", data);
  return await apiCall(
    API_ENDPOINTS.BILL_MANAGEMENT.CreateWithdrawal,
    "POST",
    data,
    token
  );
};

export const getReceipientDetails = async ({
  data,
  token,
}: {
  data: IRecepeintDetailsRequest;
  token: string;
}): Promise<IRecepeintDetailsResponse> => {
  return await apiCall(
    API_ENDPOINTS.MONEY_TRANSFER.GetRecepientDetails,
    "POST",
    data,
    token
  );
};

export const transferMoney = async ({
  data,
  token,
}: {
  data: ITransferRequest;
  token: string;
}): Promise<ITransferResponse> => {
  return await apiCall(
    API_ENDPOINTS.MONEY_TRANSFER.Trasnsfer,
    "POST",
    data,
    token
  );
};

interface IRecepeintDetailsRequest {
  accountNo: string;
  bank: string;
  transfer_type: string;
}

interface IWithdrawalRequest {
  amount: string;
  fee: string;
  bank_account_id: string;
}

interface IWithdrawalResponse {
  status: string;
  data: {
    amount: string;
    fee: string;
    bank_account_id: string;
    user_id: number;
    status: string;
    reference: string;
    total: number;
    updated_at: string;
    created_at: string;
    id: number;
  };
  message: string;
}

export interface IRecepeintDetails {
  name: string;
  clientId: string;
  bvn: string;
  account: {
    number: string;
    id: string;
  };
  status: string;
  currency: string;
  bank: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
}

type IRecepeintDetailsResponse = {
  status: string;
  message: string;
  data: IRecepeintDetails;
};

export interface ITransferRequest {
  toClientId: string;
  toClient: string; // Beneficiary's client name
  toClientName: string;
  toSavingsId: string;
  toBvn: string;
  toAccount: string; // Beneficiary's account number
  toBank: string; // Beneficiary's bank code, its 9999
  amount: string; // Amount to transfer
  remark: string; // Transaction remark
  transferType: "intra" | "inter"; // Specify transfer type (intra or inter)
}

interface ITransferResponse {
  status: string;
  message: string;
  data: {
    txnId: string;
  };
}
