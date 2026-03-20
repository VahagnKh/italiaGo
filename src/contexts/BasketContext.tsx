import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface BasketItem {
  basketId: string;
  id: string;
  type: string;
  name: string;
  price: number;
  image?: string;
  location?: string;
  duration?: string;
}

interface BasketContextType {
  basket: BasketItem[];
  addToBasket: (item: any) => void;
  removeFromBasket: (basketId: string) => void;
  clearBasket: () => void;
  basketTotal: number;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const { addNotification } = useNotifications();

  // Load basket from local storage on mount
  useEffect(() => {
    const savedBasket = localStorage.getItem('basket');
    if (savedBasket) {
      try {
        setBasket(JSON.parse(savedBasket));
      } catch (e) {
        console.error('Failed to parse basket from localStorage', e);
      }
    }
  }, []);

  // Save basket to local storage on change
  useEffect(() => {
    localStorage.setItem('basket', JSON.stringify(basket));
  }, [basket]);

  const addToBasket = (item: any) => {
    const basketId = Math.random().toString(36).substring(7);
    const newItem: BasketItem = {
      basketId,
      id: item.id,
      type: item.type || 'experience',
      name: item.name,
      price: item.price || 0,
      image: item.image,
      location: item.location,
      duration: item.duration
    };
    setBasket(prev => [...prev, newItem]);
    addNotification(`${item.name} added to your basket`, 'success');
  };

  const removeFromBasket = (basketId: string) => {
    setBasket(prev => prev.filter(item => item.basketId !== basketId));
    addNotification('Item removed from basket', 'info');
  };

  const clearBasket = () => {
    setBasket([]);
    localStorage.removeItem('basket');
  };

  const basketTotal = basket.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <BasketContext.Provider value={{ basket, addToBasket, removeFromBasket, clearBasket, basketTotal }}>
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
};
