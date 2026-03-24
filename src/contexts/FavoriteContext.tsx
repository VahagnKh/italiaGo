import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  listing_type: string;
  name?: string;
  image_url?: string;
  location?: string;
  type?: string;
}

interface FavoriteContextType {
  favorites: Favorite[];
  loading: boolean;
  toggleFavorite: (item: any) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'favorites'),
      where('user_id', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favoritesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Favorite[];
      setFavorites(favoritesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching favorites:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (item: any) => {
    if (!user) return;

    const itemId = item.id || item.listing_id;
    const existing = favorites.find(f => f.listing_id === itemId);
    if (existing) {
      await deleteDoc(doc(db, 'favorites', existing.id));
    } else {
      await addDoc(collection(db, 'favorites'), {
        user_id: user.uid,
        listing_id: itemId,
        listing_type: item.type || item.listing_type || 'unknown',
        name: item.name || '',
        image_url: item.image_url || item.image || '',
        location: item.location || '',
        type: item.type || item.listing_type || ''
      });
    }
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(f => f.listing_id === itemId);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
