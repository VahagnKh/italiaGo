import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  price_category: string;
  gallery_images: string[];
  image?: string;
  rating: number;
  reviews_count: number;
  type: string;
  created_at: any;
}

interface Review {
  id: string;
  listing_id: string;
  rating: number;
  comment: string;
  username: string;
  date: string;
}

interface ListingContextType {
  listings: Listing[];
  loading: boolean;
  fetchListings: (category?: string, filters?: any) => Promise<void>;
  getListingById: (id: string, type: string) => Promise<Listing | null>;
  getReviewsByListingId: (listingId: string) => Promise<Review[]>;
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<Review>;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const ListingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = async (category?: string, filters?: any) => {
    setLoading(true);
    try {
      let allListings: Listing[] = [];
      const collections = category && category !== 'all' 
        ? [category] 
        : ['hotels', 'restaurants', 'experiences', 'tours', 'rentals', 'events', 'taxi'];

      for (const colName of collections) {
        let q = query(collection(db, colName), orderBy('created_at', 'desc'));
        
        if (filters?.location) {
          q = query(q, where('location', '==', filters.location));
        }

        const snapshot = await getDocs(q);
        const colListings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: colName.slice(0, -1)
        })) as Listing[];
        
        allListings = [...allListings, ...colListings];
      }

      setListings(allListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getListingById = async (id: string, type: string) => {
    const colName = type === 'taxi' ? 'taxi' : type + 's';
    const docRef = doc(db, colName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), type } as Listing;
    }
    return null;
  };

  const getReviewsByListingId = async (listingId: string) => {
    const q = query(collection(db, 'reviews'), where('listing_id', '==', listingId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
  };

  const addReview = async (review: Omit<Review, 'id' | 'date'>) => {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      date: new Date().toISOString()
    });
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as Review;
  };

  return (
    <ListingContext.Provider value={{ listings, loading, fetchListings, getListingById, getReviewsByListingId, addReview }}>
      {children}
    </ListingContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
};
