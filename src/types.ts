export interface User {
  id: number;
  email: string;
  name: string;
  wallet_balance: number;
  bonus: number;
  avatar_url?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  type: 'hotel' | 'restaurant' | 'tour' | 'taxi';
  item_name: string;
  details: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'city' | 'restaurant' | 'hotel';
}
