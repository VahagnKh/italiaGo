export interface AppUser {
  uid: string;
  id?: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  bonus: number;
  wallet_balance?: number;
  total_spent?: number;
  avatar_url?: string;
  status?: string;
  last_game_win?: string;
  disabled?: number;
  created_at?: any;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  name: string;
  image_url: string;
  location: string;
  type: string;
}

export interface Booking {
  id: string;
  user_id: string;
  type: 'hotel' | 'restaurant' | 'tour' | 'taxi' | 'experience' | 'rental' | 'event';
  listing_id: string;
  listing_type: string;
  item_name: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: any;
  date: string;
  time?: string;
  guests?: number;
  details?: any;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'city' | 'restaurant' | 'hotel';
}
