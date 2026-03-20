import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ListingProvider } from './contexts/ListingContext';
import { BookingProvider } from './contexts/BookingContext';
import { FavoriteProvider } from './contexts/FavoriteContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BasketProvider } from './contexts/BasketContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ListingProvider>
            <BookingProvider>
              <FavoriteProvider>
                <NotificationProvider>
                  <BasketProvider>
                    <App />
                  </BasketProvider>
                </NotificationProvider>
              </FavoriteProvider>
            </BookingProvider>
          </ListingProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
