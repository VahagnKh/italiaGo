import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface Booking {
  id: string;
  user_id: string;
  type: 'hotel' | 'restaurant' | 'experience' | 'tour' | 'rental' | 'taxi' | 'event';
  listing_id: string;
  listing_type: string;
  item_name: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: any;
  details?: any;
}

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  createBooking: (bookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'createdAt'> & { status?: Booking['status'] }) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'createdAt'> & { status?: Booking['status'] }) => {
    if (!user) throw new Error("User must be logged in to book");

    const { status, ...rest } = bookingData;

    await addDoc(collection(db, 'bookings'), {
      ...rest,
      user_id: user.uid,
      status: status || 'pending',
      created_at: serverTimestamp()
    });
  };

  const cancelBooking = async (bookingId: string) => {
    const { updateDoc, doc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled'
    });
  };

  return (
    <BookingContext.Provider value={{ bookings, loading, createBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};
