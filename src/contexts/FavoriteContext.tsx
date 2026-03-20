import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: string;
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
      where('userId', '==', user.uid)
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

    const itemId = item.id || item.itemId;
    const existing = favorites.find(f => f.itemId === itemId);
    if (existing) {
      await deleteDoc(doc(db, 'favorites', existing.id));
    } else {
      await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        itemId,
        itemType: item.type || item.itemType || 'unknown',
        name: item.name || '',
        image_url: item.image_url || item.image || '',
        location: item.location || '',
        type: item.type || item.itemType || ''
      });
    }
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(f => f.itemId === itemId);
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
