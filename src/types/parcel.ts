export interface Rider {
  id: number;
  name: string;
  phone: string;
  profile_picture: string | null;
  email: string;
  role: string;
}

export interface AcceptedBid {
  id: number;
  bid_amount: string;
  rider_id: number;
  send_parcel_id: number;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_id: number | null;
  rider: Rider;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Parcel {
  id: number;
  user_id: number;
  accepted_bid_id: number;
  delivery_fee: string;
  amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_coordinates: Coordinates;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_coordinates: Coordinates;
  description: string;
  parcel_category: string;
  parcel_name: string;
  parcel_value: string;
  payer: "sender" | "receiver";
  payment_method: "wallet" | "bank_transfer";
  pay_on_delivery: "yes" | "no";
  accepted_bid: AcceptedBid;
}
