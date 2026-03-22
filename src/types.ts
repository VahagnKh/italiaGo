export interface AppUser {
  uid: string;
  id?: string; // Some parts use id instead of uid
  email: string;
  name: string;
  role: 'user' | 'admin';
  bonus: number;
  wallet_balance?: number;
  total_spent?: number;
  avatar_url?: string;
  status?: string;
  last_game_win?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: string;
  name: string;
  image_url: string;
  location: string;
  type: string;
}

export interface Booking {
  id: string;
  userId: string;
  type: 'hotel' | 'restaurant' | 'tour' | 'taxi' | 'experience' | 'rental' | 'event';
  itemId: string;
  itemName: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: any;
  details?: any;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'city' | 'restaurant' | 'hotel';
}
