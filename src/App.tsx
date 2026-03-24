import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  Utensils, 
  Hotel, 
  Car, 
  Compass, 
  Sparkles, 
  Globe, 
  Map as MapIcon, 
  X, 
  ShoppingBag, 
  Trash2, 
  Sun, 
  Moon, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  Menu, 
  Heart,
  VolumeX,
  Briefcase,
  Baby,
  Dog,
  MessageSquare,
  LayoutDashboard,
  Camera,
  Upload,
  Shield,
  Search,
  BookOpen,
  CheckSquare,
  Users,
  Settings,
  Bell,
  MoreVertical,
  Play,
  Filter,
  ChevronRight,
  ChevronLeft,
  Award,
  Clock,
  Send,
  Plane,
  Ship,
  CreditCard,
  Tag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useLanguage } from './contexts/LanguageContext';
import AuthModal from './components/AuthModal';
import AdminView from './components/AdminView';
import AIConcierge from './components/AIConcierge';
import TranslatedText from './components/TranslatedText';
import TasksPage from './pages/TasksPage';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
];

const DESTINATIONS = [
  {
    id: 'rome',
    name: 'Rome',
    tagline: 'The Eternal City',
    image: 'https://picsum.photos/seed/rome/800/600',
    description: 'Where ancient history meets modern vibrant life.'
  },
  {
    id: 'milan',
    name: 'Milan',
    tagline: 'Fashion & Design',
    image: 'https://picsum.photos/seed/milan/800/600',
    description: 'The sophisticated heart of Italian commerce and style.'
  },
  {
    id: 'florence',
    name: 'Florence',
    tagline: 'Cradle of Renaissance',
    image: 'https://picsum.photos/seed/florence/800/600',
    description: 'An open-air museum of art and architectural wonders.'
  },
  {
    id: 'venice',
    name: 'Venice',
    tagline: 'The Floating City',
    image: 'https://picsum.photos/seed/venice/800/600',
    description: 'A magical city of canals, bridges, and timeless romance.'
  },
  {
    id: 'amalfi',
    name: 'Amalfi',
    tagline: 'Coastal Paradise',
    image: 'https://picsum.photos/seed/amalfi/800/600',
    description: 'Dramatic cliffs and turquoise waters of the Mediterranean.'
  },
  {
    id: 'lake-como',
    name: 'Lake Como',
    tagline: 'Alpine Elegance',
    image: 'https://picsum.photos/seed/como/800/600',
    description: 'Serene waters surrounded by majestic mountains and luxury villas.'
  }
];

const STORIES = [
  {
    id: 's1',
    title: 'A Sunset in Positano',
    author: 'Elena Rossi',
    image: 'https://picsum.photos/seed/positano-story/800/1000',
    excerpt: 'The sky turned a deep shade of orange as the sun dipped below the horizon, painting the colorful houses of Positano in a magical light...'
  },
  {
    id: 's2',
    title: 'The Secret Gardens of Rome',
    author: 'Marco Bianchi',
    image: 'https://picsum.photos/seed/rome-story/800/1000',
    excerpt: 'Hidden behind high stone walls and ancient gates, Rome\'s secret gardens offer a peaceful escape from the bustling city streets...'
  },
  {
    id: 's3',
    title: 'Truffle Hunting in Piedmont',
    author: 'Sofia Conti',
    image: 'https://picsum.photos/seed/truffle-story/800/1000',
    excerpt: 'Following the expert nose of a truffle dog through the misty woods of Piedmont is an experience like no other...'
  }
];

export default function App() {
  const { language: lang, setLanguage: setLang, t } = useLanguage();
  const [view, setView] = useState<'home' | 'checkout' | 'hotels' | 'restaurants' | 'tours' | 'taxi' | 'experiences' | 'rentals' | 'events' | 'overview' | 'inbox' | 'lessons' | 'tasks' | 'groups' | 'friends' | 'settings' | 'discover' | 'notifications' | 'favorites' | 'profile'>('home');
  const [initialFilter, setInitialFilter] = useState('all');
  const [initialPriceFilter, setInitialPriceFilter] = useState('all');
  const [initialSearch, setInitialSearch] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [basket, setBasket] = useState<any[]>([]);
  const [showBasket, setShowBasket] = useState(false);
  const [favorites, setFavorites] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<{ id: string, message: string, type: 'success' | 'info' | 'error' }[]>([]);
  const [infoModal, setInfoModal] = useState<{ title: string, content: string } | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              ...data,
              role: (firebaseUser.email === 'ekyuregh@gmail.com' && firebaseUser.emailVerified) ? 'admin' : (data.role || 'user')
            });
          } else {
            // Fallback for users without a document
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: (firebaseUser.email === 'ekyuregh@gmail.com' && firebaseUser.emailVerified) ? 'admin' : 'user'
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            role: 'user'
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Filter out benign Vite/WebSocket errors
      const msg = event.message || "";
      const file = event.filename || "";
      if (msg.includes('WebSocket closed without opened') || 
          msg.includes('[vite]') ||
          msg.includes('failed to connect to websocket') ||
          file.includes('/@vite/client')) {
        return;
      }

      const errorData = {
        message: event.message || "Unknown error",
        stack: event.error?.stack || "No stack trace available",
        url: event.filename || window.location.href,
        line: event.lineno,
        col: event.colno,
        type: 'error'
      };
      console.error("Client-side error details:", errorData);
      fetch('/api/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {}); // Silently fail to avoid infinite loops
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason);
      // Filter out benign Vite/WebSocket errors
      if (reason.includes('WebSocket closed without opened') || 
          reason.includes('[vite]') ||
          reason.includes('failed to connect to websocket')) {
        return;
      }

      const errorData = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || "No stack trace available",
        url: window.location.href,
        type: 'rejection'
      };
      console.error("Unhandled promise rejection details:", errorData);
      fetch('/api/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {}); // Silently fail
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const [reconnectKey, setReconnectKey] = useState(0);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      if (user?.role === 'admin') {
        socket.send(JSON.stringify({ type: 'auth', role: 'admin' }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        addNotification(data.notification.message, data.notification.type === 'security' ? 'error' : 'info');
        if (user?.role === 'admin') {
          setAdminNotifications(prev => [data.notification, ...prev].slice(0, 20));
        }
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => setReconnectKey(prev => prev + 1), 5000);
    };

    setWs(socket);
    return () => socket.close();
  }, [user, reconnectKey]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const token = localStorage.getItem('token');
      fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject('Not OK'))
        .then(data => setAdminNotifications(Array.isArray(data) ? data : []))
        .catch(err => console.error('Failed to fetch admin notifications:', err));
    }
  }, [user]);

  const markNotificationsAsRead = async () => {
    if (user?.role !== 'admin') return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/notifications/read', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAdminNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    } catch (e) { console.error(e); }
  };

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.ok ? res.json() : Promise.reject('Not OK'))
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch listings:', err));
  }, []);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch('/api/log-activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'PAGE_VISIT', page: view })
      }).catch(console.error);
    }
  }, [view, user]);

  const HOTELS = listings.filter(l => l.type === 'hotel');
  const RESTAURANTS = listings.filter(l => l.type === 'restaurant');
  const TOURS = listings.filter(l => l.type === 'tour');
  const EXPERIENCES = listings.filter(l => l.type === 'experience');
  const RENTALS = listings.filter(l => l.type === 'rental');
  const EVENTS = listings.filter(l => l.type === 'event');

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const addToBasket = (item: any) => {
    setBasket(prev => [...prev, { ...item, basketId: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeFromBasket = (basketId: string) => {
    setBasket(prev => prev.filter(item => item.basketId !== basketId));
  };

  const basketTotal = basket.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (item: any) => {
    const isFav = favorites.some(f => f.id === item.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== item.id));
    } else {
      setFavorites(prev => [...prev, item]);
    }
  };

  useEffect(() => {
    // If user just logged in and is on a non-home view, ensure they have a valid view
    if (user && !['overview', 'inbox', 'tasks', 'notifications', 'favorites', 'profile', 'settings', 'home'].includes(view)) {
      setView('overview');
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
      {user && view !== 'home' && view !== 'checkout' ? (
        <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
          <Sidebar view={view} setView={setView} user={user} setUser={setUser} setShowAdmin={setShowAdmin} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar setView={setView} user={user} />
            <main className="flex-1 overflow-y-auto px-8">
              {view === 'overview' && <DashboardHome user={user} setView={setView} />}
              {view === 'inbox' && <InboxView user={user} />}
              {view === 'tasks' && <TasksPage />}
              {view === 'notifications' && (
                <div className="max-w-4xl mx-auto py-10 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-6 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-2xl flex items-center justify-center text-[#7C3AED] shrink-0">
                          <Bell size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900">New destination added!</p>
                          <p className="text-xs text-gray-400">Check out the new luxury resort in Amalfi Coast.</p>
                          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-1">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {view === 'favorites' && (
                <div className="space-y-8 py-10">
                  <h2 className="text-2xl font-bold text-gray-900">Saved Places</h2>
                  <ListView items={favorites} type="hotel" title="Favorites" t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter="all" initialPriceFilter="all" initialSearch="" />
                </div>
              )}
              {view === 'profile' && (
                <div className="max-w-4xl mx-auto py-10">
                   <DashboardView user={user} t={t} favorites={favorites} onRemoveFavorite={toggleFavorite} refreshUser={refreshUser} addNotification={(m) => console.log(m)} />
                </div>
              )}
              {view === 'settings' && <SettingsView user={user} setUser={setUser} />}
              
              {/* Fallback for old views if needed */}
              {['hotels', 'restaurants', 'experiences', 'tours', 'rentals', 'events'].includes(view) && (
                <div className="max-w-7xl mx-auto py-10">
                   <button onClick={() => setView('overview')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-xs uppercase tracking-widest">
                     <ArrowLeft size={16} /> Back to Dashboard
                   </button>
                   {view === 'hotels' && <ListView items={HOTELS} type="hotel" title={t.hotels} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'restaurants' && <ListView items={RESTAURANTS} type="restaurant" title={t.restaurants} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'experiences' && <ListView items={EXPERIENCES} type="experience" title={t.experiences} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'tours' && <ListView items={TOURS} type="tour" title={t.tours} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'rentals' && <ListView items={RENTALS} type="rental" title={t.rentals} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'events' && <ListView items={EVENTS} type="event" title={t.events} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                </div>
              )}
            </main>
          </div>
          <RightPanel user={user} />
        </div>
      ) : (
        <>
          {/* Navbar */}
          <nav className="fixed top-0 w-full z-40 bg-nav backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-1 sm:gap-4">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-ink/60 hover:bg-paper/50 rounded-full transition-colors"
          >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-ink rounded-lg flex items-center justify-center text-paper font-display font-bold shrink-0 text-sm sm:text-base">I</div>
            <span className="font-display text-base sm:text-xl font-bold tracking-tight text-ink whitespace-nowrap">{t.title}</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 xl:gap-8 text-[10px] xl:text-xs font-bold uppercase tracking-widest text-ink/60">
          <button onClick={() => { setView('discover'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'discover' ? 'text-ink' : ''}`}>Discover All</button>
          <button onClick={() => { setView('hotels'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'hotels' ? 'text-ink' : ''}`}>{t.hotels}</button>
          <button onClick={() => { setView('restaurants'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'restaurants' ? 'text-ink' : ''}`}>{t.restaurants}</button>
          <button onClick={() => { setView('experiences'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'experiences' ? 'text-ink' : ''}`}>{t.experiences}</button>
          <button onClick={() => { setView('tours'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'tours' ? 'text-ink' : ''}`}>{t.tours}</button>
          <button onClick={() => { setView('rentals'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'rentals' ? 'text-ink' : ''}`}>{t.rentals}</button>
          <button onClick={() => { setView('events'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'events' ? 'text-ink' : ''}`}>{t.events}</button>
          {user && (
            <button 
              onClick={() => setView('overview')} 
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent/80 transition-colors shadow-lg shadow-accent/20"
            >
              <LayoutDashboard size={14} />
              Dashboard
            </button>
          )}
          {(user?.role === 'admin' || user?.name === 'Marco Rossi') && !user && (
            <button 
              onClick={() => setShowAdmin(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
            >
              <LayoutDashboard size={14} />
              Admin
            </button>
          )}
        </div>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed top-[73px] left-0 w-64 h-[calc(100vh-73px)] bg-card border-r border-border p-6 flex flex-col gap-6 z-50 lg:hidden"
            >
              <button onClick={() => { setView('discover'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">Discover All</button>
              <button onClick={() => { setView('hotels'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.hotels}</button>
              <button onClick={() => { setView('restaurants'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.restaurants}</button>
              <button onClick={() => { setView('experiences'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.experiences}</button>
              <button onClick={() => { setView('tours'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.tours}</button>
              <button onClick={() => { setView('rentals'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.rentals}</button>
              <button onClick={() => { setView('events'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.events}</button>
              {(user?.role === 'admin' || user?.name === 'Marco Rossi') && (
                <button 
                  onClick={() => { setShowAdmin(true); setShowMobileMenu(false); }} 
                  className="flex items-center gap-2 text-left text-sm font-bold uppercase tracking-widest text-gold"
                >
                  <LayoutDashboard size={18} />
                  Admin Panel
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowBasket(!showBasket)}
              className="relative p-1.5 sm:p-2 rounded-full border border-border hover:bg-paper transition-colors text-ink"
            >
              <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
              {basket.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gold text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                  {basket.length}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showBasket && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-ink">{t.basket}</h3>
                    <button onClick={() => setShowBasket(false)} className="text-ink"><X size={16} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                    {basket.length === 0 ? (
                      <p className="text-center text-ink/40 py-8 italic text-sm">{t.emptyBasket}</p>
                    ) : (
                      basket.map((item) => (
                        <div key={item.basketId} className="flex gap-3 group">
                          <img src={item.image || undefined} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-ink">{item.name}</h4>
                            <p className="text-[10px] text-ink/40">{item.location}</p>
                            <p className="text-xs font-bold mt-1 text-ink">€{item.price}</p>
                          </div>
                          <button 
                            onClick={() => removeFromBasket(item.basketId)}
                            className="text-ink/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {basket.length > 0 && (
                    <div className="p-4 bg-paper/30 border-t border-border space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.total}</span>
                        <span className="text-xl font-display text-ink">€{basketTotal.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => { setView('checkout'); setShowBasket(false); }}
                        className="w-full btn-luxury py-3 text-xs"
                      >
                        {t.checkout}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border hover:bg-paper transition-colors text-xs sm:text-sm text-ink"
            >
              <Globe size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code as any); setShowLangMenu(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-colors ${lang === l.code ? 'bg-gold text-white' : 'text-ink hover:bg-paper'}`}
                      >
                        <span>{l.flag}</span>
                        <span className="font-medium">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user?.role === 'admin' && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowAdminNotifications(!showAdminNotifications);
                  if (!showAdminNotifications) markNotificationsAsRead();
                }}
                className="relative p-1.5 sm:p-2 rounded-full border border-border hover:bg-paper transition-colors text-ink"
              >
                <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
                {adminNotifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-card rounded-full" />
                )}
              </button>
              
              <AnimatePresence>
                {showAdminNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-border flex justify-between items-center bg-paper/30">
                      <h3 className="font-bold text-xs uppercase tracking-widest text-ink">Admin Alerts</h3>
                      <button onClick={() => setShowAdminNotifications(false)} className="text-ink"><X size={14} /></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      {adminNotifications.length === 0 ? (
                        <p className="text-center text-ink/40 py-8 italic text-xs">No recent alerts</p>
                      ) : (
                        adminNotifications.map((n) => (
                          <div key={n.id} className={`p-3 rounded-xl transition-colors mb-1 ${n.read ? 'opacity-60' : 'bg-paper/50 border-l-4 border-gold'}`}>
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                n.type === 'security' ? 'bg-red-100 text-red-600' : 
                                n.type === 'registration' ? 'bg-blue-100 text-blue-600' : 
                                'bg-emerald-100 text-emerald-600'
                              }`}>
                                {n.type}
                              </span>
                              <span className="text-[9px] text-ink/40">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs text-ink mt-1 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-border bg-paper/30">
                      <button 
                        onClick={() => { setShowAdmin(true); setShowAdminNotifications(false); }}
                        className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-ink/60 hover:text-ink transition-colors"
                      >
                        View All in Admin Panel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="relative">
            {user ? (
            <div className="flex items-center gap-1.5 sm:gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 p-1 sm:px-4 sm:py-2 rounded-full border border-border hover:bg-paper transition-colors"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 sm:w-6 sm:h-6 bg-gold rounded-full flex items-center justify-center text-[9px] sm:text-[10px] text-white font-bold shrink-0">
                      {user.name.split(' ').map((n: any) => n[0]).join('')}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-ink truncate max-w-[80px]">{user.name}</span>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-border bg-paper/30">
                          <p className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">Account</p>
                          <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          {user && (
                            <button 
                              onClick={() => { setView('overview'); setShowProfileMenu(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-ink hover:bg-paper transition-colors"
                            >
                              <LayoutDashboard size={16} className="text-accent" />
                              Dashboard
                            </button>
                          )}
                          {user.role === 'admin' && (
                            <button 
                              onClick={() => { setShowAdmin(true); setShowProfileMenu(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-ink hover:bg-paper transition-colors"
                            >
                              <Shield size={16} className="text-gold" />
                              Admin Panel
                            </button>
                          )}
                          <div className="h-px bg-border my-2" />
                          <button 
                            onClick={() => { auth.signOut(); setShowProfileMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="btn-luxury text-[9px] sm:text-sm px-3 py-2 sm:px-6 sm:py-3 whitespace-nowrap">Sign In</button>
          )}
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {view !== 'home' && (
          <div className="max-w-7xl mx-auto px-6 pt-8">
            <button 
              onClick={() => setView('home')} 
              className="flex items-center gap-2 text-ink/60 hover:text-ink transition-colors font-bold text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> {t.back}
            </button>
          </div>
        )}
        {view === 'home' && <HomeView setView={setView} t={t} lang={lang} setInfoModal={setInfoModal} setInitialFilter={setInitialFilter} addNotification={addNotification} />}
        {view === 'discover' && <ListView items={listings} type="all" title="Discover All" t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
        {view === 'checkout' && <CheckoutView setView={setView} basket={basket} basketTotal={basketTotal} onPaymentSuccess={() => { setBasket([]); refreshUser(); }} user={user} />}
        {view === 'hotels' && <ListView items={HOTELS} type="hotel" title={t.hotels} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
        {view === 'restaurants' && <ListView items={RESTAURANTS} type="restaurant" title={t.restaurants} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
        {view === 'experiences' && <ListView items={EXPERIENCES} type="experience" title={t.experiences} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
        {view === 'tours' && <ListView items={TOURS} type="tour" title={t.tours} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
        {view === 'rentals' && <ListView items={RENTALS} type="rental" title={t.rentals} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
        {view === 'events' && <ListView items={EVENTS} type="event" title={t.events} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
        {view === 'taxi' && <TaxiView t={t} lang={lang} user={user} refreshUser={refreshUser} />}
        {showAdmin && user?.role === 'admin' && (
          <AdminView onClose={() => setShowAdmin(false)} />
        )}
      </main>

      <footer className="bg-ink text-paper py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-display text-2xl">{t.title}</h3>
            <p className="text-paper/60 text-sm leading-relaxed">
              Crafting unforgettable Italian experiences through technology and heritage.
            </p>
            <div className="pt-4 h-48 rounded-2xl overflow-hidden border border-border">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen 
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.142293761308!2d12.4963655!3d41.8902102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61b6532013ad%3A0x72f0ab10a0506514!2sColosseum!5e0!3m2!1sen!2sit!4v1620000000000!5m2!1sen!2sit"
              ></iframe>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gold">Explore</h4>
            <ul className="space-y-3 text-sm text-paper/60">
              <li><button onClick={() => { setView('home'); setTimeout(() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-paper">Destinations</button></li>
              <li><button onClick={() => { setView('hotels'); setInitialFilter('all'); setInitialPriceFilter('high'); setInitialSearch(''); }} className="hover:text-paper">Luxury Stays</button></li>
              <li><button onClick={() => { setView('experiences'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch('Culinary'); }} className="hover:text-paper">Culinary Tours</button></li>
              <li><button onClick={() => { setView('taxi'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="hover:text-paper">Private Transport</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gold">Support</h4>
            <ul className="space-y-3 text-sm text-paper/60">
              <li><button onClick={() => setShowAI(true)} className="hover:text-paper">Help Center</button></li>
              <li><button onClick={() => setInfoModal({ title: 'Safety Info', content: 'Your safety is our priority. We work with certified partners and provide 24/7 support during your Italian journey.' })} className="hover:text-paper">Safety Info</button></li>
              <li><button onClick={() => setInfoModal({ title: 'Refund Policy', content: 'Cancellations made 48 hours before the scheduled experience are eligible for a full refund.' })} className="hover:text-paper">Refund Policy</button></li>
              <li><button onClick={() => setShowAI(true)} className="hover:text-paper">Contact Us</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gold">Newsletter</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-paper/10 border-none rounded-full px-4 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-gold" />
              <button 
                onClick={() => addNotification('Thank you for joining our newsletter!', 'success')}
                className="bg-gold text-ink px-4 py-2 rounded-full text-sm font-bold"
              >
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-paper/40">
          <p>© 2026 ItaliaGo. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => setInfoModal({ title: 'Privacy Policy', content: 'We value your privacy. Your data is encrypted and never shared with third parties without your consent.' })} className="hover:text-paper">Privacy Policy</button>
            <button onClick={() => setInfoModal({ title: 'Terms of Service', content: 'By using ItaliaGo, you agree to our terms of providing luxury travel concierge services.' })} className="hover:text-paper">Terms of Service</button>
            <button onClick={() => setInfoModal({ title: 'Cookie Policy', content: 'We use cookies to enhance your experience and provide personalized travel recommendations.' })} className="hover:text-paper">Cookie Policy</button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 left-8 w-12 h-12 bg-gold text-white rounded-full shadow-2xl flex items-center justify-center z-[100] hover:scale-110 transition-transform"
          >
            <ArrowRight size={20} className="-rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-md text-sm font-bold flex items-center gap-3 pointer-events-auto ${
                n.type === 'success' ? 'bg-emerald-500/90 text-white' :
                n.type === 'error' ? 'bg-red-500/90 text-white' :
                'bg-ink/90 text-paper'
              }`}
            >
              <Sparkles size={16} />
              {n.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )}

      <AIConcierge isOpen={showAI} setIsOpen={setShowAI} />
      <AnimatePresence>
        {showAdmin && <AdminView onClose={() => { setShowAdmin(false); fetch('/api/listings').then(res => res.json()).then(data => setListings(Array.isArray(data) ? data : [])); }} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {infoModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-[2rem] overflow-hidden shadow-2xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display italic text-ink">{infoModal.title}</h2>
                <button onClick={() => setInfoModal(null)} className="p-2 hover:bg-paper rounded-full transition-colors text-ink">
                  <X size={20} />
                </button>
              </div>
              <p className="text-ink/70 leading-relaxed">
                {infoModal.content}
              </p>
              <button 
                onClick={() => setInfoModal(null)}
                className="w-full btn-luxury py-4"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onSuccess={() => {
              setShowAuthModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeView({ setView, t, lang, setInfoModal, setInitialFilter, addNotification }: { setView: any, t: any, lang: string, setInfoModal: any, setInitialFilter: (f: string) => void, addNotification: (m: string, type?: any) => void }) {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Background with Ken Burns */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=1920" 
              alt="Italy Landscape" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#F8F9FB]" />
        </div>
        
        <div className="relative z-10 text-center text-white space-y-10 px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.span 
              initial={{ letterSpacing: "0.2em", opacity: 0 }}
              animate={{ letterSpacing: "0.5em", opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="text-gold font-bold uppercase text-xs sm:text-sm block tracking-[0.5em]"
            >
              <TranslatedText text="Benvenuti in Italia" lang={lang} />
            </motion.span>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-display italic leading-tight text-glow">
              {t.discover}
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="text-lg sm:text-xl md:text-2xl font-light tracking-wide opacity-80 max-w-2xl mx-auto leading-relaxed"
          >
            {t.companion}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} 
              className="btn-luxury group flex items-center gap-4 px-12 py-5 text-base hover:shadow-2xl hover:shadow-gold/30"
            >
              {t.start}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('discover')}
              className="px-10 py-5 rounded-full border-2 border-white/40 bg-white/5 backdrop-blur-md transition-all text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-white/20 hover:border-white/80"
            >
              <TranslatedText text="Explore Destinations" lang={lang} />
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">Scroll</span>
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent" 
          />
        </motion.div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-20"
        >
          <span className="text-gold font-bold uppercase tracking-[0.5em] text-[10px]">What We Offer</span>
          <h2 className="text-4xl md:text-6xl font-display italic text-ink">Luxury Services</h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {[
            { icon: Hotel, label: t.hotels, color: 'bg-blue-50/50 dark:bg-blue-900/10', view: 'hotels' },
            { icon: Utensils, label: t.restaurants, color: 'bg-orange-50/50 dark:bg-orange-900/10', view: 'restaurants' },
            { icon: Sparkles, label: t.experiences, color: 'bg-yellow-50/50 dark:bg-yellow-900/10', view: 'experiences' },
            { icon: Compass, label: t.tours, color: 'bg-emerald-50/50 dark:bg-emerald-900/10', view: 'tours' },
            { icon: Car, label: t.rentals, color: 'bg-red-50/50 dark:bg-red-900/10', view: 'rentals' },
            { icon: MapIcon, label: t.taxi, color: 'bg-purple-50/50 dark:bg-purple-900/10', view: 'taxi' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12, scale: 1.05 }}
              onClick={() => setView(item.view as any)}
              className="luxury-card p-10 flex flex-col items-center text-center space-y-6 cursor-pointer group"
            >
              <div className={`w-20 h-20 ${item.color} rounded-[2rem] flex items-center justify-center text-ink group-hover:bg-gold group-hover:text-white transition-all duration-500 shadow-xl`}>
                <item.icon size={36} />
              </div>
              <h3 className="font-bold text-[11px] uppercase tracking-[0.2em] text-ink group-hover:text-gold transition-colors">{item.label}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Signature Experiences - Bento Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-20"
        >
          <span className="text-gold font-bold uppercase tracking-[0.5em] text-[10px]">Exclusive Access</span>
          <h2 className="text-4xl md:text-6xl font-display italic text-ink">Signature Experiences</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-8 h-[800px]">
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 md:row-span-2 relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
          >
            <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 p-12 text-white space-y-4">
              <span className="text-gold font-bold uppercase tracking-widest text-xs">Venetian Dreams</span>
              <h3 className="text-4xl font-display italic">Private Gondola Serenade</h3>
              <p className="text-sm opacity-0 group-hover:opacity-80 transition-opacity duration-500 font-light max-w-md">Experience the magic of Venice's hidden canals with a private musician and champagne service.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
          >
            <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 p-10 text-white space-y-2">
              <span className="text-gold font-bold uppercase tracking-widest text-[10px]">Tuscan Heritage</span>
              <h3 className="text-2xl font-display italic">Vintage Alfa Romeo Tour</h3>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
          >
            <img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 p-8 text-white">
              <h3 className="text-xl font-display italic">Amalfi Sunset Yacht</h3>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
          >
            <img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 p-8 text-white">
              <h3 className="text-xl font-display italic">Dolomites Helicopter Safari</h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-ink py-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
          {[
            { label: 'Destinations', value: '150+' },
            { label: 'Luxury Hotels', value: '450+' },
            { label: 'Happy Travelers', value: '25k+' },
            { label: 'Expert Guides', value: '120+' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-5xl md:text-7xl font-display italic text-gold">{stat.value}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Suggestions */}
      <section className="max-w-7xl mx-auto px-6">
        <Suggestions t={t} />
      </section>

      {/* Destinations */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-10"
        >
          <div className="space-y-4">
            <span className="text-gold font-bold uppercase tracking-[0.5em] text-[10px]">Curated Selection</span>
            <h2 className="text-4xl md:text-6xl font-display italic text-ink">{t.featured}</h2>
            <p className="text-ink/60 italic text-lg">Handpicked escapes for the discerning traveler.</p>
          </div>
          <motion.button 
            whileHover={{ gap: "1.5rem" }}
            onClick={() => setView('discover')} 
            className="btn-outline flex items-center gap-3 group px-8 py-4"
          >
            View All <ArrowRight size={18} className="transition-transform" />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {DESTINATIONS.map((dest, index) => (
            <motion.div 
              key={dest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -15 }}
              onClick={() => {
                setInitialFilter(dest.name);
                setView('discover');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer"
            >
              <img 
                src={dest.image || undefined} 
                alt={dest.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-0 p-10 text-white space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-gold">{dest.tagline}</span>
                <h3 className="text-4xl md:text-5xl font-display italic">{dest.name}</h3>
                <p className="text-sm opacity-0 group-hover:opacity-80 font-light leading-relaxed transition-opacity duration-500 line-clamp-3">
                  <TranslatedText text={dest.description} lang={lang} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section className="bg-paper/50 py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-6"
          >
            <span className="text-gold font-bold uppercase tracking-[0.5em] text-[10px]">Travel Journals</span>
            <h2 className="text-5xl md:text-7xl font-display italic text-ink">{t.stories}</h2>
            <p className="text-ink/60 italic max-w-2xl mx-auto text-lg">Discover Italy through the eyes of fellow travelers.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {STORIES.map((story, index) => (
              <motion.div 
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="space-y-8 group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <img 
                    src={story.image || undefined} 
                    alt={story.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">By {story.author}</p>
                  <h3 className="text-3xl font-display italic group-hover:text-gold transition-colors duration-500">{story.title}</h3>
                  <p className="text-base text-ink/60 leading-relaxed line-clamp-3 font-light">
                    <TranslatedText text={story.excerpt} lang={lang} />
                  </p>
                  <motion.button 
                    whileHover={{ gap: "1.5rem" }}
                    onClick={() => addNotification("Full story coming soon to ItaliaGo Magazine.", 'info')}
                    className="text-xs font-bold flex items-center gap-3 uppercase tracking-widest group-hover:text-gold transition-all"
                  >
                    Read More <ArrowRight size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-ink rounded-[4rem] p-16 md:p-32 text-center text-white space-y-10 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
        >
          <motion.div 
            initial={{ scale: 1.2 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 3 }}
            className="absolute inset-0 opacity-30"
          >
            <img 
              src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1920" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </motion.div>
          
          <div className="relative z-10 space-y-8">
            <span className="text-gold font-bold uppercase tracking-[0.5em] text-xs">Stay Inspired</span>
            <h2 className="text-5xl md:text-7xl font-display italic">Join the Inner Circle</h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg font-light">Get exclusive travel guides, early access to boutique openings, and curated Italian experiences delivered to your inbox.</p>
            
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 pt-6" onSubmit={(e) => { e.preventDefault(); addNotification("Welcome to the Inner Circle!", 'success'); }}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-all backdrop-blur-md"
                required
              />
              <button type="submit" className="btn-luxury px-10 py-4">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function TicTacToe({ user, onWin, t, addNotification }: { user: any, onWin: () => void, t: any, addNotification: (m: string, type?: any) => void }) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [mode, setMode] = useState<'bot' | 'online' | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [mySymbol, setMySymbol] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'playing' | 'gameOver' | 'idle'>('idle');

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return squares.includes(null) ? null : 'draw';
  };

  const minimax = (board: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const result = calculateWinner(board);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          let score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const handleBotMove = (currentBoard: (string | null)[]) => {
    let bestScore = -Infinity;
    let move = -1;
    const tempBoard = [...currentBoard];

    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === null) {
        tempBoard[i] = 'O';
        let score = minimax(tempBoard, 0, false);
        tempBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    if (move !== -1) {
      const newBoard = [...currentBoard];
      newBoard[move] = 'O';
      setBoard(newBoard);
      setIsXNext(true);
      const win = calculateWinner(newBoard);
      if (win) setWinner(win);
    }
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;

    if (mode === 'bot') {
      if (!isXNext) return;
      const newBoard = [...board];
      newBoard[i] = 'X';
      setBoard(newBoard);
      setIsXNext(false);
      const win = calculateWinner(newBoard);
      if (win) {
        setWinner(win);
      } else {
        setTimeout(() => handleBotMove(newBoard), 500);
      }
    } else if (mode === 'online' && socket && isMyTurn) {
      socket.send(JSON.stringify({ type: 'move', index: i }));
    }
  };

  useEffect(() => {
    if (winner === 'X' || (mode === 'online' && winner === 'you')) {
      onWin();
    }
  }, [winner]);

  const startOnline = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    setSocket(ws);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomId: 'global' }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'waiting') setStatus('waiting');
      if (msg.type === 'start') {
        setMySymbol(msg.symbol);
        setIsMyTurn(msg.turn);
        setStatus('playing');
        setBoard(Array(9).fill(null));
      }
      if (msg.type === 'update') {
        setBoard(msg.board);
        setIsMyTurn(msg.turn);
      }
      if (msg.type === 'gameOver') {
        setWinner(msg.winner);
        setStatus('gameOver');
      }
      if (msg.type === 'opponentLeft') {
        addNotification('Opponent left the game.', 'info');
        reset();
      }
    };
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setMode(null);
    if (socket) socket.close();
    setSocket(null);
    setStatus('idle');
  };

  if (!user || user.status === 'Normal') {
    return (
      <div className="bg-paper/30 rounded-3xl p-12 text-center border border-dashed border-border space-y-4">
        <Lock size={48} className="mx-auto text-ink/10" />
        <h3 className="text-xl font-display italic text-ink">Access Restricted</h3>
        <p className="text-sm text-ink/60">You need <span className="text-gold font-bold">Advanced</span> status or higher to play the minigame and earn discounts.</p>
        <p className="text-[10px] text-ink/40 uppercase tracking-widest">Current Status: {user?.status || 'Guest'}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-display italic text-ink">Tic Tac Toe Challenge</h3>
          {mode === 'bot' && <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1"><Sparkles size={10} /> Difficulty: Impossible</span>}
        </div>
        {mode && <button onClick={reset} className="text-xs font-bold uppercase tracking-widest text-gold hover:underline">Change Mode</button>}
      </div>

      {!mode ? (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setMode('bot')} className="btn-luxury py-8 flex flex-col items-center gap-3">
            <Compass size={32} />
            <span>Play vs Bot</span>
          </button>
          <button onClick={startOnline} className="btn-outline py-8 flex flex-col items-center gap-3">
            <Globe size={32} />
            <span>Play Online</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {status === 'waiting' ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-ink/60 italic">Waiting for an opponent...</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-ink/40">
                  {winner ? (winner === 'draw' ? "It's a Draw!" : (winner === 'X' || winner === 'you' ? "You Won! 10% Discount Earned!" : "You Lost! Try Again.")) : (mode === 'online' ? (isMyTurn ? "Your Turn" : "Opponent's Turn") : (isXNext ? "Your Turn" : "Bot's Turn"))}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
                {board.map((cell, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: cell ? 1 : 1.05 }}
                    whileTap={{ scale: cell ? 1 : 0.95 }}
                    onClick={() => handleClick(i)}
                    className={`h-24 rounded-2xl flex items-center justify-center text-4xl font-display transition-all border shadow-sm ${
                      cell === 'X' ? 'bg-ink text-paper border-ink' : 
                      cell === 'O' ? 'bg-gold text-white border-gold' : 
                      'bg-paper text-ink/20 hover:text-ink/40 border-border'
                    }`}
                  >
                    {cell && (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                      >
                        {cell}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
              {winner && (
                <button onClick={reset} className="w-full btn-luxury py-4 mt-4">Play Again</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DashboardView({ user, t, favorites, onRemoveFavorite, refreshUser, addNotification }: { user: any, t: any, favorites: any[], onRemoveFavorite: (item: any) => void, refreshUser: () => void, addNotification: (m: string, type?: any) => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'market' | 'game' | 'profile'>('bookings');
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar_url || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Toby',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, avatar_url: profileAvatar }),
      });
      if (res.ok) {
        refreshUser();
        addNotification('Profile updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []));
    
    fetch('/api/offers', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setOffers(Array.isArray(data) ? data : []));
  }, []);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-display italic text-ink">Please log in to view your dashboard.</h2>
      </div>
    );
  }

  const handleRedeem = async (offer: any) => {
    if (user.bonus < offer.discountPoints) {
      addNotification('Insufficient bonus points', 'error');
      return;
    }

    setIsRedeeming(offer.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ offerId: offer.id, points: Number(offer.discountPoints) })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(`Successfully redeemed! Voucher: ITALIA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 'success');
        refreshUser();
      } else {
        addNotification(data.error || 'Redemption failed', 'error');
      }
    } catch (err) {
      console.error('Redemption failed:', err);
      addNotification('Connection error during redemption', 'error');
    } finally {
      setIsRedeeming(null);
    }
  };

  const handleCancelBooking = async (booking: any) => {
    setIsCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
        addNotification('Booking cancelled successfully', 'success');
      } else {
        const data = await res.json();
        addNotification(data.error || 'Cancellation failed', 'error');
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
      addNotification('Connection error during cancellation', 'error');
    } finally {
      setIsCancelling(false);
      setCancellingBooking(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl text-ink">{t.welcomeBack}, {user.name}</h1>
          <p className="text-sm sm:text-base text-ink/60">{t.manageBookings}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center min-w-[150px]">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">{t.wallet}</span>
            <span className="text-2xl font-display text-ink">€{user.wallet_balance.toFixed(2)}</span>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center min-w-[150px]">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">{t.bonus}</span>
            <span className="text-2xl font-display text-gold">{user.bonus}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'bookings' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          {t.recentBookings}
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'favorites' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          {t.yourFavorites} ({favorites.length})
        </button>
        <button 
          onClick={() => setActiveTab('market')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'market' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          {t.bonusMarket}
        </button>
        <button 
          onClick={() => setActiveTab('game')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'game' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          Minigame
          {!user.last_game_win && user.status !== 'Normal' && (
            <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'profile' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          {t.profileSettings}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'bookings' && (
            <>
              {!user.last_game_win && user.status !== 'Normal' && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gold/10 border border-gold/20 rounded-3xl p-6 mb-8 flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center text-gold">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink">Win a 10% Discount!</h4>
                      <p className="text-xs text-ink/60">Challenge the bot or play online to save on your next booking.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('game')}
                    className="px-6 py-3 bg-ink text-paper rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                  >
                    Play Now
                  </button>
                </motion.div>
              )}
              <h2 className="text-2xl font-display italic text-ink">{t.recentBookings}</h2>
              <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="bg-paper/50 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-paper/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-paper rounded-lg flex items-center justify-center text-ink">
                                {booking.type === 'hotel' && <Hotel size={14} />}
                                {booking.type === 'restaurant' && <Utensils size={14} />}
                                {booking.type === 'taxi' && <Car size={14} />}
                                {booking.type === 'tour' && <Compass size={14} />}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-ink">{booking.item_name}</p>
                                <p className="text-[10px] text-ink/40 uppercase tracking-widest">{booking.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-ink/60">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                              booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                              'bg-paper text-ink/40'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm text-ink">
                            €{booking.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {booking.type === 'taxi' && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button 
                                onClick={() => setCancellingBooking(booking)}
                                className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                title="Cancel Ride"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-ink/40 italic">
                            No bookings found. Start exploring!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {activeTab === 'favorites' && (
            <>
              <h2 className="text-2xl font-display italic text-ink">{t.yourFavorites}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favorites.map((item) => (
                  <div key={item.id} className="luxury-card group">
                    <div className="h-48 overflow-hidden relative">
                      <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <button 
                        onClick={() => onRemoveFavorite(item)}
                        className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="p-4 space-y-2 bg-card">
                      <h3 className="font-display text-lg text-ink">{item.name}</h3>
                      <p className="text-xs text-ink/60 flex items-center gap-1">
                        <MapPin size={10} /> {item.location}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-sm text-ink">€{item.price}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: item.stars }).map((_, j) => (
                            <Star key={j} size={8} fill="currentColor" className="text-gold" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {favorites.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <Heart size={48} className="mx-auto text-ink/10" />
                    <p className="text-ink/40 italic">You haven't added any favorites yet.</p>
                  </div>
                )}
              </div>
            </>
          )}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display italic text-ink">{t.bonusMarket}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="luxury-card group">
                    <div className="h-48 overflow-hidden relative">
                      <img src={offer.image || undefined} alt={offer.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                        Save €{offer.discountValue}
                      </div>
                    </div>
                    <div className="p-6 space-y-4 bg-card">
                      <div>
                        <h4 className="font-bold text-lg text-ink">{offer.name}</h4>
                        <p className="text-xs text-ink/40 uppercase tracking-widest">{offer.type}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Cost</span>
                          <span className="font-bold text-gold">{offer.discountPoints} Points</span>
                        </div>
                        <button 
                          onClick={() => handleRedeem(offer)}
                          disabled={isRedeeming === offer.id || user.bonus < offer.discountPoints}
                          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            user.bonus >= offer.discountPoints 
                              ? 'bg-ink text-paper hover:bg-gold' 
                              : 'bg-paper text-ink/20 cursor-not-allowed'
                          }`}
                        >
                          {isRedeeming === offer.id ? 'Redeeming...' : 'Redeem Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {offers.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4 bg-paper/30 rounded-[2.5rem] border border-dashed border-border">
                    <Sparkles size={48} className="mx-auto text-ink/10" />
                    <p className="text-ink/40 italic">No special offers available right now. Keep exploring Italy!</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'game' && (
            <TicTacToe 
              user={user} 
              t={t} 
              addNotification={addNotification}
              onWin={() => {
                const token = localStorage.getItem('token');
                fetch('/api/game-win', { 
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                }).then(() => refreshUser());
              }} 
            />
          )}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-display italic text-ink">{t.profileSettings}</h2>
              <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gold shadow-xl" />
                      ) : (
                        <div className="w-32 h-32 bg-gold rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-xl">
                          {profileName[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white" size={32} />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">Choose an Avatar</h4>
                      <div className="flex flex-wrap gap-3">
                        {avatars.map((av) => (
                          <button 
                            key={av}
                            type="button"
                            onClick={() => setProfileAvatar(av)}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${profileAvatar === av ? 'border-gold shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <div className="relative pt-2">
                        <Upload className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-ink/20" size={16} />
                        <input 
                          type="text" 
                          placeholder="Or paste a custom image URL" 
                          value={profileAvatar}
                          onChange={(e) => setProfileAvatar(e.target.value)}
                          className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-1 focus:ring-gold text-ink text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
                        <input 
                          type="email" 
                          disabled
                          value={user.email}
                          className="w-full bg-paper/20 border-none rounded-2xl pl-12 pr-4 py-4 outline-none text-ink/40 cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      disabled={isUpdatingProfile}
                      className="btn-luxury px-12 py-4 flex items-center gap-3"
                    >
                      {isUpdatingProfile ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : <Sparkles size={18} />}
                      {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-ink text-paper p-8 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-display italic">Your Rewards</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  user.status === 'Rich' ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                  user.status === 'Pro' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                  user.status === 'Advanced' ? 'bg-gold/20 border-gold text-gold' :
                  'bg-paper/10 border-paper/20 text-paper/40'
                }`}>
                  {user.status}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-display text-gold">{user.bonus}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-paper/40 mb-2">Points</span>
              </div>
              <div className="h-2 bg-paper/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((user.bonus / 500) * 100, 100)}%` }}
                  className="h-full bg-gold"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-paper/40">
                {user.status === 'Rich' ? 'Maximum Status Reached' : 
                 user.status === 'Pro' ? `${Math.max(0, 10000 - user.total_spent).toFixed(0)}€ more for Rich status` :
                 user.status === 'Advanced' ? `${Math.max(0, 2000 - user.total_spent).toFixed(0)}€ more for Pro status` :
                 `${Math.max(0, 500 - user.total_spent).toFixed(0)}€ more for Advanced status`}
              </p>
            </div>
          </div>

          <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-widest text-ink/40">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Bookings</span>
                <p className="text-xl font-display text-ink">{bookings.length}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Favorites</span>
                <p className="text-xl font-display text-ink">{favorites.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {cancellingBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCancelling && setCancellingBooking(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-[2.5rem] overflow-hidden shadow-2xl p-8 space-y-6 border border-border"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                  <X size={32} />
                </div>
                <h3 className="text-2xl font-display italic text-ink">Cancel Taxi Ride?</h3>
                <p className="text-sm text-ink/60">
                  Are you sure you want to cancel your ride for <span className="font-bold text-ink">{cancellingBooking.item_name}</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={isCancelling}
                  onClick={() => setCancellingBooking(null)}
                  className="flex-1 px-6 py-4 rounded-full border border-border text-xs font-bold uppercase tracking-widest hover:bg-paper transition-colors disabled:opacity-50"
                >
                  No, Keep it
                </button>
                <button 
                  disabled={isCancelling}
                  onClick={() => handleCancelBooking(cancellingBooking)}
                  className="flex-1 px-6 py-4 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCancelling ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


function Sidebar({ view, setView, user, setUser, setShowAdmin }: { view: string, setView: (v: any) => void, user: any, setUser: (u: any) => void, setShowAdmin: (s: boolean) => void }) {
  const { t } = useLanguage();
  const menuItems = [
    { id: 'home', label: 'Main Page', icon: Globe },
    { id: 'overview', label: t.destinations, icon: MapIcon },
    { id: 'inbox', label: t.messages, icon: Mail },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'favorites', label: t.savedPlaces, icon: Heart },
    { id: 'profile', label: t.account, icon: User },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="hidden lg:flex flex-col w-72 bg-white h-full border-r border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-display font-bold">
          I
        </div>
        <span className="text-2xl font-display font-bold tracking-tight text-gray-900">Tourvisto</span>
      </div>

      <div className="space-y-1.5 flex-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${
              view === item.id ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={18} className={view === item.id ? 'text-gold' : ''} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8 space-y-6">
        <div className="bg-black text-white rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer">
          <div className="relative z-10 space-y-3">
            <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center text-gold">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-sm font-display italic">{t.upgradePro}</p>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-1">{t.upgradeDesc}</p>
            </div>
            <button className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline">{t.learnMore}</button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gold/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
        </div>

        <div className="space-y-1">
          {user.role === 'admin' && (
            <button
              onClick={() => setShowAdmin(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold/5 transition-all"
            >
              <Shield size={18} />
              {t.admin}
            </button>
          )}
          <button
            onClick={() => { auth.signOut(); setView('home'); }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ setView, user }: { setView: (v: any) => void, user: any }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  return (
    <header className="bg-white/80 backdrop-blur-md px-8 py-6 flex items-center justify-between sticky top-0 z-30 border-b border-gray-50">
      <div className="flex-1 max-w-xl">
        <h1 className="text-2xl font-display italic text-gray-900">{t.welcomeBack}, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{t.manageBookings}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search your trips..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm w-64 outline-none focus:ring-2 focus:ring-black/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-colors">
            <Mail size={20} />
          </button>
        </div>
        <div className="h-10 w-px bg-gray-100" />
        <button onClick={() => setView('profile')} className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900 group-hover:text-gold transition-colors">{user.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{user.role}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
          </div>
        </button>
      </div>
    </header>
  );
}

function DashboardHome({ user, setView }: { user: any, setView: (v: any) => void }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('popular');
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const hotels = listings.filter(l => l.type === 'hotel');
  const resorts = listings.filter(l => l.type === 'experience').slice(0, 3);

  return (
    <div className="space-y-10 pb-10">
      {/* Hotels Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Hotels</h2>
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            {['popular', 'best-price', 'near-me'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.slice(0, 3).map((hotel) => (
            <div key={`hotel-${hotel.id}`} className="group relative h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl shadow-gray-200/50">
              <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-6 right-6">
                <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all">
                  <Heart size={20} />
                </button>
              </div>
              <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80">
                  <MapPin size={12} /> {hotel.location}
                </div>
                <h3 className="text-xl font-bold leading-tight">{hotel.name}</h3>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{hotel.rating || 4.8}</span>
                  </div>
                  <div className="text-lg font-bold">
                    ${hotel.price}<span className="text-xs font-normal opacity-60">/night</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Resorts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Best Resorts</h2>
            <button className="text-[#7C3AED] text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {resorts.map((resort) => (
              <div key={`resort-${resort.id}`} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-6 hover:shadow-xl transition-all group cursor-pointer">
                <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0">
                  <img src={resort.image} alt={resort.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <MapPin size={10} /> {resort.location}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{resort.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-900">{resort.rating || 4.5}</span>
                    </div>
                    <div className="text-sm font-bold text-[#7C3AED]">
                      ${resort.price}<span className="text-xs font-normal text-gray-400">/person</span>
                    </div>
                  </div>
                </div>
                <button className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#7C3AED] group-hover:text-white transition-all mr-2">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.availableDates}</h2>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900">{t.months[2]} 2026</h3>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {t.days.map((d: string, i: number) => (
                <span key={`${d}-${i}`} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === 11;
                const isRange = day > 11 && day < 16;
                return (
                  <button
                    key={i}
                    className={`h-8 w-8 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected ? 'bg-[#7C3AED] text-white' : 
                      isRange ? 'bg-[#7C3AED]/10 text-[#7C3AED]' :
                      'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <button className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl text-sm font-bold hover:bg-black transition-all">
              {t.checkAvailability}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ user }: { user: any }) {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/friends', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="hidden xl:flex flex-col w-96 bg-white h-full p-8 overflow-y-auto space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#7C3AED] border-4 border-white rounded-xl flex items-center justify-center text-white">
            <Camera size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-xs text-gray-400 mt-1">Traveler & Explorer</p>
        </div>
      </div>

      {/* Transportation Icons */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Plane, label: 'Flight', color: 'bg-blue-50 text-blue-500' },
          { icon: Hotel, label: 'Hotel', color: 'bg-orange-50 text-orange-500' },
          { icon: Car, label: 'Car', color: 'bg-purple-50 text-purple-500' },
          { icon: Ship, label: 'Ship', color: 'bg-emerald-50 text-emerald-500' },
        ].map((item, i) => (
          <div key={i} className="space-y-2 text-center">
            <div className={`w-full aspect-square ${item.color} rounded-2xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer`}>
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Friends List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Travel Friends</h2>
          <button className="text-[#7C3AED] text-xs font-bold hover:underline">Add New</button>
        </div>
        <div className="flex -space-x-3 overflow-hidden">
          {friends.map((friend, i) => (
            <div key={friend.id} className="inline-block h-10 w-10 rounded-full ring-4 ring-white overflow-hidden bg-gray-100">
              <img src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full object-cover" />
            </div>
          ))}
          <button className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-white bg-gray-100 text-gray-400 text-xs font-bold hover:bg-gray-200 transition-colors">
            +12
          </button>
        </div>
      </div>

      {/* Credit Card Widget */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-8 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Balance</p>
            <p className="text-2xl font-bold">$12,850.00</p>
          </div>
          <div className="w-12 h-8 bg-white/10 rounded-lg backdrop-blur-md flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-widest">**** **** **** 4580</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Exp: 12/26</p>
          </div>
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-red-500/80" />
            <div className="w-6 h-6 rounded-full bg-yellow-500/80" />
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -left-10 -top-10 w-20 h-20 bg-white/5 rounded-full" />
      </div>
    </div>
  );
}

function InboxView({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/messages', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []));
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const token = localStorage.getItem('token');
    fetch('/api/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId: 1, content }) // Simplified: send to admin/mentor 1
    })
    .then(() => {
      setContent('');
      fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()).then(data => setMessages(Array.isArray(data) ? data : []));
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Inbox</h2>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-4 ${m.sender_id === user.id ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
              <img src={m.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.sender_name}`} alt={m.sender_name} />
            </div>
            <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
              m.sender_id === user.id ? 'bg-[#7C3AED] text-white rounded-tr-none' : 'bg-gray-50 text-gray-900 rounded-tl-none'
            }`}>
              <p>{m.content}</p>
              <p className={`text-[10px] mt-2 opacity-60 ${m.sender_id === user.id ? 'text-white' : 'text-gray-400'}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <Mail size={48} className="opacity-10" />
            <p className="italic">No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="p-6 border-t border-gray-50 flex gap-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
        />
        <button type="submit" className="w-14 h-14 bg-[#7C3AED] text-white rounded-2xl flex items-center justify-center hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20">
          <Send size={24} />
        </button>
      </form>
    </div>
  );
}


function SettingsView({ user, setUser }: { user: any, setUser: (u: any) => void }) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    fetch('/api/user/profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, avatar_url: avatar })
    })
    .then(res => res.json())
    .then(() => {
      setUser({ ...user, name, avatar_url: avatar });
      setIsSaving(false);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-2xl">
                <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button type="button" className="absolute bottom-0 right-0 w-10 h-10 bg-[#7C3AED] text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <Camera size={20} />
              </button>
            </div>
            <div className="w-full">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Paste image URL here"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 mt-2 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 outline-none text-gray-400 cursor-not-allowed text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-5 bg-[#7C3AED] text-white rounded-[1.5rem] font-bold text-sm hover:bg-[#6D28D9] transition-all shadow-xl shadow-[#7C3AED]/20 disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
function CheckoutView({ setView, basket, basketTotal, onPaymentSuccess, user }: { setView: any, basket: any[], basketTotal: number, onPaymentSuccess: () => void, user: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [bonusEarned, setBonusEarned] = useState(0);

  const minigameDiscount = user?.last_game_win ? basketTotal * 0.1 : 0;
  const pointsToUse = usePoints ? Math.min(user?.bonus || 0, Math.floor((basketTotal - minigameDiscount) * 10)) : 0;
  const discount = pointsToUse / 10;
  const finalTotal = basketTotal - minigameDiscount - discount;

  const handlePayment = async () => {
    setIsProcessing(true);
    let totalBonus = 0;
    
    // Distribute points across items (simplified: use all on first item or split)
    let remainingPoints = pointsToUse;

    const token = localStorage.getItem('token');
    for (let i = 0; i < basket.length; i++) {
      const item = basket[i];
      const itemPoints = i === basket.length - 1 ? remainingPoints : Math.min(remainingPoints, Math.floor(item.price * 10));
      remainingPoints -= itemPoints;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: item.type || 'experience',
          itemName: item.name,
          details: `${item.location} - ${item.duration || 'Booking'}`,
          amount: item.price,
          pointsUsed: itemPoints,
          minigameDiscount: !!user?.last_game_win
        })
      });
      const data = await response.json();
      totalBonus += data.bonusEarned || 0;
    }
    
    setBonusEarned(totalBonus);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onPaymentSuccess();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto"
        >
          <Star size={40} />
        </motion.div>
        <h1 className="text-4xl font-display italic text-ink">Payment Successful!</h1>
        <p className="text-ink/60">Your bookings are confirmed. We've sent the details to your email.</p>
        <div className="bg-paper p-6 rounded-3xl border border-border inline-block">
          <p className="text-sm font-bold text-ink uppercase tracking-widest mb-1">Bonus Points Earned</p>
          <p className="text-3xl font-display text-gold">+{bonusEarned}</p>
          <p className="text-[10px] text-ink/40 mt-2 italic">15% of your purchase has been added to your wallet</p>
        </div>
        <div className="pt-8 flex gap-4 justify-center">
          <button onClick={() => setView('home')} className="btn-luxury">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-display italic text-ink">Complete Your Booking</h1>
            <p className="text-sm sm:text-base text-ink/60">Secure payment via Stripe or PayPal.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-ink rounded-2xl flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-ink rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Card</span>
                </button>
                <button className="p-4 border border-border rounded-2xl flex flex-col items-center gap-2 opacity-50">
                  <div className="w-8 h-8 bg-blue-600 rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">PayPal</span>
                </button>
                <button className="p-4 border border-border rounded-2xl flex flex-col items-center gap-2 opacity-50">
                  <div className="w-8 h-8 bg-gold rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Wallet</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Card Details</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Cardholder Name" className="w-full bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                <input type="text" placeholder="Card Number" className="w-full bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                  <input type="text" placeholder="CVC" className="bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Order Summary</h3>
              <div className="bg-paper/30 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="text-ink font-bold">€{basketTotal.toFixed(2)}</span>
                </div>
                {user && user.bonus > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="use-points" 
                        checked={usePoints} 
                        onChange={() => setUsePoints(!usePoints)}
                        className="w-4 h-4 accent-gold"
                      />
                      <label htmlFor="use-points" className="text-xs font-bold uppercase tracking-widest text-ink/60 cursor-pointer">
                        Use {pointsToUse} Points for Discount
                      </label>
                    </div>
                    <span className="text-gold font-bold">-€{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg pt-4 border-t border-border">
                  <span className="font-display italic text-ink">Total</span>
                  <span className="font-display text-ink">€{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing || basket.length === 0}
              className="w-full btn-luxury h-14 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>Pay €{finalTotal.toFixed(2)}</>
              )}
            </button>
            <p className="text-center text-[10px] text-ink/40 uppercase tracking-widest">
              Secure SSL Encryption • PCI-DSS Compliant
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-display text-ink">Booking Summary</h3>
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {basket.map((item) => (
                  <div key={item.basketId} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    <img src={item.image || undefined} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-ink">{item.name}</h4>
                      <p className="text-[10px] text-ink/60">{item.location} • {item.duration || 'Experience'}</p>
                      <div className="flex items-center gap-1 text-gold mt-1">
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                      </div>
                    </div>
                    <span className="font-bold text-sm text-ink">€{item.price}</span>
                  </div>
                ))}
                {basket.length === 0 && (
                  <p className="text-center text-ink/40 py-8 italic">Your basket is empty.</p>
                )}
              </div>
              
              <div className="space-y-2 pt-4 border-t border-border">
                {user?.last_game_win && (
                  <div className="flex justify-between items-center p-3 bg-gold/10 rounded-xl border border-gold/20 mb-4">
                    <div className="flex items-center gap-2 text-gold">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Minigame Discount Applied</span>
                    </div>
                    <span className="text-xs font-bold text-gold">-10%</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="text-ink">€{basketTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Service Fee</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Taxes</span>
                  <span className="text-emerald-600">Included</span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Total Amount</span>
                <span className="text-3xl font-display text-ink">€{basketTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gold/5 rounded-3xl p-6 border border-gold/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center text-gold">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Earn {Math.floor(basketTotal)} Points</p>
              <p className="text-xs text-ink/60">Use them for future discounts or upgrades.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ itemId, type, t, lang, user }: { itemId: string, type: string, t: any, lang: string, user: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/reviews/${itemId}?type=${type}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []));
  }, [itemId, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, type, rating, comment, userId: user?.id })
      });
      const newReview = await res.json();
      setReviews(prev => [newReview, ...prev]);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <h3 className="text-xl font-display text-ink">{t.reviews}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-paper/30 p-4 rounded-2xl">
        <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.leaveReview}</h4>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setRating(num)}
              className={`p-1 transition-colors ${rating >= num ? 'text-gold' : 'text-ink/20'}`}
            >
              <Star size={20} fill={rating >= num ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.comment}
          className="w-full bg-card border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold text-ink min-h-[100px]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-luxury w-full py-2 text-xs disabled:opacity-50"
        >
          {isSubmitting ? '...' : t.submit}
        </button>
      </form>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <p className="text-sm text-ink/40 italic">{t.noReviews}</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="space-y-2 pb-4 border-b border-border last:border-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-ink">{review.user_name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill={review.rating > i ? 'currentColor' : 'none'}
                      className={review.rating > i ? 'text-gold' : 'text-ink/20'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink/60 leading-relaxed">
                <TranslatedText text={review.comment} lang={lang} />
              </p>
              <p className="text-[10px] text-ink/30">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ListView({ items, type, title, t, lang, onAddToBasket, favorites, onToggleFavorite, user, initialFilter = 'all', initialPriceFilter = 'all', initialSearch = '' }: { items: any[], type: string, title: string, t: any, lang: string, onAddToBasket: (item: any) => void, favorites: any[], onToggleFavorite: (item: any) => void, user: any, initialFilter?: string, initialPriceFilter?: string, initialSearch?: string }) {
  const [filter, setFilter] = useState(initialFilter);
  const [priceFilter, setPriceFilter] = useState(initialPriceFilter);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState(initialSearch);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setPriceFilter(initialPriceFilter);
  }, [initialPriceFilter]);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const locations = Array.from(new Set(['all', ...items.map(item => item.location), filter].filter(Boolean)));
  const priceLevels = ['all', 'low', 'medium', 'high'];
  const starLevels = ['all', 3, 4, 5];

  const filteredItems = items.filter(item => {
    const locMatch = filter === 'all' || (item.location || '') === filter;
    const priceMatch = priceFilter === 'all' || (item.price_level || '') === priceFilter;
    const starMatch = starFilter === 'all' || (item.stars || 0) >= (starFilter as number);
    const searchMatch = !search || 
      (item.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    return locMatch && priceMatch && starMatch && searchMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display italic text-ink">{title}</h1>
            <p className="text-xs sm:text-sm text-ink/60 italic">Curated selections for an authentic Italian experience.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl sm:rounded-full border border-border shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40 px-3 whitespace-nowrap">{t.filter}</span>
              <div className="flex gap-1">
                {locations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => setFilter(loc)}
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                      filter === loc 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-paper text-ink/60'
                    }`}
                  >
                    {loc === 'all' ? t.all : loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl sm:rounded-full border border-border shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40 px-3 whitespace-nowrap">{t.priceRange}</span>
              <div className="flex gap-1">
                {priceLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setPriceFilter(level)}
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                      priceFilter === level 
                        ? 'bg-gold text-white' 
                        : 'hover:bg-paper text-ink/60'
                    }`}
                  >
                    {level === 'all' ? t.all : t[level]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl sm:rounded-full border border-border shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40 px-3 whitespace-nowrap">{t.rating}</span>
              <div className="flex gap-1">
                {starLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setStarFilter(level as any)}
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                      starFilter === level 
                        ? 'bg-gold text-white' 
                        : 'hover:bg-paper text-ink/60'
                    }`}
                  >
                    {level === 'all' ? t.all : (
                      <>
                        {level} <Star size={10} fill="currentColor" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <motion.div 
              key={`${item.type}-${item.id}`}
              whileHover={{ y: -15 }}
              className="luxury-card group cursor-pointer"
            >
              <div className="h-72 overflow-hidden relative">
                <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    {Array.from({ length: item.stars }).map((_, j) => (
                      <Star key={j} size={10} fill="currentColor" className="text-gold" />
                    ))}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${
                      favorites.some(f => f.id === item.id && f.type === item.type) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-ink/40 hover:text-red-500'
                    }`}
                  >
                    <Heart size={16} fill={favorites.some(f => f.id === item.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="absolute bottom-6 left-6 bg-ink/80 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest shadow-2xl">
                  {item.category || item.type}
                </div>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-ink leading-tight group-hover:text-accent transition-colors">{item.name}</h3>
                    <div className="flex items-center gap-2 text-ink/40 text-xs">
                      <MapPin size={12} />
                      <span>{item.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">${item.price_per_night || item.price}</p>
                    <p className="text-[9px] font-bold text-ink/30 uppercase tracking-widest">{item.type === 'hotel' ? t.perNight : t.perPerson}</p>
                  </div>
                </div>
                <p className="text-xs text-ink/50 leading-relaxed line-clamp-2 italic">
                  {item.description || "Experience the finest Italian hospitality in a setting of unparalleled beauty and historic charm."}
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddToBasket(item); }}
                    className="flex-1 btn-luxury py-4"
                  >
                    {t.bookNow}
                  </button>
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="w-14 h-14 rounded-2xl border border-gray-100 flex items-center justify-center text-ink/40 hover:border-accent hover:text-accent transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-paper rounded-full flex items-center justify-center mx-auto text-ink/20">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-display italic text-ink">No results found</h3>
              <p className="text-ink/60 max-w-md mx-auto">We couldn't find any {type === 'all' ? 'items' : type + 's'} matching your current filters. Try adjusting your search or explore our recommendations below.</p>
              <button 
                onClick={() => { setFilter('all'); setPriceFilter('all'); setStarFilter('all'); setSearch(''); }}
                className="text-gold font-bold uppercase tracking-widest text-xs hover:underline"
              >
                Clear all filters
              </button>
            </div>

            <div className="pt-12 border-t border-border">
              <Suggestions t={t} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-20">
        <Suggestions t={t} />
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-card/80 backdrop-blur rounded-full flex items-center justify-center text-ink hover:bg-card transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="overflow-y-auto flex-1">
                <div className="h-64 overflow-hidden">
                  <img src={selectedItem.image || undefined} alt={selectedItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="p-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display text-ink">{selectedItem.name}</h2>
                    <p className="text-ink/60 flex items-center gap-1">
                      <MapPin size={14} /> {selectedItem.location}
                    </p>
                  </div>
                  {selectedItem.price && <span className="text-2xl font-display text-ink">€{selectedItem.price}</span>}
                </div>
                
                <div className="space-y-4">
                  <p className="text-ink/80 leading-relaxed">
                    <TranslatedText text={selectedItem.description} lang={lang} />
                  </p>
                  
                  {selectedItem.amenities && (
                    <div className="flex flex-wrap gap-2">
                      {(typeof selectedItem.amenities === 'string' ? selectedItem.amenities.split(',') : selectedItem.amenities).map((a: string) => (
                        <span key={a} className="px-3 py-1 bg-paper rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <TranslatedText text={a.trim()} lang={lang} />
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    {selectedItem.address && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Address</h4>
                        <p className="text-xs text-ink/80">{selectedItem.address}</p>
                        {selectedItem.map_url && (
                          <a href={selectedItem.map_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gold font-bold hover:underline flex items-center gap-1">
                            <MapPin size={10} /> View on Map
                          </a>
                        )}
                      </div>
                    )}
                    {selectedItem.availability && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Availability</h4>
                        <p className="text-xs text-ink/80">{selectedItem.availability}</p>
                      </div>
                    )}
                    {selectedItem.duration && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Duration</h4>
                        <p className="text-xs text-ink/80">{selectedItem.duration}</p>
                      </div>
                    )}
                    {selectedItem.hours && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Hours</h4>
                        <p className="text-xs text-ink/80">{selectedItem.hours}</p>
                      </div>
                    )}
                    {selectedItem.cuisine_type && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Cuisine</h4>
                        <p className="text-xs text-ink/80">{selectedItem.cuisine_type}</p>
                      </div>
                    )}
                  </div>

                  {selectedItem.promotions && (
                    <div className="p-4 bg-gold/10 border border-gold/20 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white">
                        <Tag size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Promotion</h4>
                        <p className="text-sm text-ink/80 font-medium">{selectedItem.promotions}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-2">Heritage & Info</h4>
                    <p className="text-sm text-ink/60 italic leading-relaxed">
                      <TranslatedText text={selectedItem.details || selectedItem.history || selectedItem.info || ''} lang={lang} />
                    </p>
                  </div>

                  <ReviewsSection itemId={selectedItem.id} type={selectedItem.type} t={t} lang={lang} user={user} />

                  <div className="pt-6">
                    <button 
                      onClick={() => { onAddToBasket(selectedItem); setSelectedItem(null); }}
                      className="w-full btn-luxury py-4"
                    >
                      {t.addToBasket}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
}

function Suggestions({ t }: { t: any }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null') return;
    
    fetch('/api/suggestions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSuggestions(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching suggestions:", err));
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display italic text-ink flex items-center gap-2">
        <Sparkles size={20} className="text-gold" />
        {t.suggestions || 'Recommended for You'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map(item => (
          <motion.div 
            key={`${item.type}-${item.id}`}
            whileHover={{ y: -5 }}
            className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm group cursor-pointer"
          >
            <div className="h-32 relative overflow-hidden">
              <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-gold">
                {(item.type || 'item').toUpperCase()}
              </div>
            </div>
            <div className="p-3 space-y-1">
              <h4 className="font-bold text-xs text-ink line-clamp-1">{item.name}</h4>
              <div className="flex justify-between items-center">
                <span className="text-gold font-display text-sm">€{item.price}</span>
                <div className="flex items-center gap-1 text-[10px] text-ink/40">
                  <Star size={8} fill="currentColor" className="text-gold" />
                  {item.rating}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TaxiView({ t, lang, user, refreshUser }: { t: any, lang: string, user: any, refreshUser: () => void }) {
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [pickup, setPickup] = useState('Piazza del Popolo, Roma');
  const [destination, setDestination] = useState('');
  const [selectedCar, setSelectedCar] = useState<number>(0);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [isRequesting, setIsRequesting] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [rideOptions, setRideOptions] = useState<string[]>([]);
  const [rideStatus, setRideStatus] = useState<'idle' | 'searching' | 'enroute' | 'arrived'>('idle');
  const [estimate, setEstimate] = useState<{ cost: number, time: number, traffic: string, distance: string } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, (err) => {
      console.error("Geolocation error:", err);
      // Fallback to Rome
      setCoords({ lat: 41.9028, lng: 12.4964 });
    });
  }, []);

  const VEHICLES = [
    { 
      id: 0, 
      company: 'Roma Elite Transports', 
      name: 'Mercedes S-Class', 
      type: 'Luxury Sedan', 
      basePrice: 45, 
      multiplier: 1.5, 
      stars: 5, 
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Alessandro', rating: 4.9, photo: 'https://i.pravatar.cc/150?u=alessandro', trips: 1240, carPlate: 'RM 452 EL' }
    },
    { 
      id: 1, 
      company: 'Prestige Italia', 
      name: 'Range Rover Vogue', 
      type: 'Luxury SUV', 
      basePrice: 60, 
      multiplier: 1.8, 
      stars: 5, 
      image: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Marco', rating: 4.8, photo: 'https://i.pravatar.cc/150?u=marco', trips: 850, carPlate: 'PR 782 IT' }
    },
    { 
      id: 2, 
      company: 'Veloce Luxury', 
      name: 'Maserati Quattroporte', 
      type: 'Sport Luxury', 
      basePrice: 80, 
      multiplier: 2.2, 
      stars: 4, 
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Giulia', rating: 4.9, photo: 'https://i.pravatar.cc/150?u=giulia', trips: 520, carPlate: 'VL 991 SP' }
    },
    { 
      id: 3, 
      company: 'City Cab Roma', 
      name: 'Toyota Prius', 
      type: 'Economy Hybrid', 
      basePrice: 15, 
      multiplier: 0.8, 
      stars: 3, 
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Luca', rating: 4.6, photo: 'https://i.pravatar.cc/150?u=luca', trips: 3400, carPlate: 'CC 112 RM' }
    },
    { 
      id: 4, 
      company: 'EcoTravel Italy', 
      name: 'Tesla Model S', 
      type: 'Premium Electric', 
      basePrice: 50, 
      multiplier: 1.6, 
      stars: 5, 
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Sofia', rating: 5.0, photo: 'https://i.pravatar.cc/150?u=sofia', trips: 210, carPlate: 'ET 001 TS' }
    },
    { 
      id: 5, 
      company: 'Standard Transports', 
      name: 'Volkswagen Passat', 
      type: 'Standard Sedan', 
      basePrice: 25, 
      multiplier: 1.0, 
      stars: 3, 
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Pietro', rating: 4.7, photo: 'https://i.pravatar.cc/150?u=pietro', trips: 1560, carPlate: 'ST 552 TR' }
    },
  ];

  const filteredVehicles = VEHICLES.filter(v => starFilter === 'all' || v.stars === starFilter);

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    if (val.length > 3) {
      const dist = (val.length * 0.4).toFixed(1);
      const trafficLevels = ['Low', 'Moderate', 'Heavy'];
      const traffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
      const trafficMult = traffic === 'Heavy' ? 1.6 : (traffic === 'Moderate' ? 1.2 : 1);
      const car = VEHICLES[selectedCar];
      
      setEstimate({
        distance: `${dist} km`,
        cost: (car.basePrice + parseFloat(dist) * car.multiplier) * trafficMult,
        time: Math.round(parseFloat(dist) * 3 * trafficMult),
        traffic
      });
    } else {
      setEstimate(null);
    }
  };

  const handleRequest = async () => {
    if (!destination || !estimate) return;
    setIsRequesting(true);
    
    const minigameDiscount = user?.last_game_win ? estimate.cost * 0.1 : 0;
    const pointsToUse = usePoints ? Math.min(user?.bonus || 0, Math.floor((estimate.cost - minigameDiscount) * 10)) : 0;
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'taxi',
          itemName: `Ride to ${destination}`,
          details: `From ${pickup} to ${destination}. Options: ${rideOptions.join(', ')}`,
          amount: estimate.cost,
          pointsUsed: pointsToUse,
          minigameDiscount: !!user?.last_game_win
        })
      });
      
      setRideStatus('searching');
      setTimeout(() => setRideStatus('enroute'), 2500);
      setTimeout(() => {
        setRideStatus('arrived');
        // Refresh user data to show new points
        refreshUser();
      }, 8000);
    } catch (err) {
      console.error("Booking error:", err);
      setIsRequesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-display italic text-ink">
            {t.privateTransport}
          </h1>
          <p className="text-ink/60 italic">
            {t.luxuryFingertips}
          </p>
        </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-card p-2 rounded-full border border-border shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 px-4 whitespace-nowrap">{t.rating}</span>
                <div className="flex gap-1">
                  {['all', 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setStarFilter(level as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                        starFilter === level 
                          ? 'bg-gold text-white' 
                          : 'hover:bg-paper text-ink/60'
                      }`}
                    >
                      {level === 'all' ? t.all : (
                        <>
                          {level} <Star size={10} fill="currentColor" />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {user && user.bonus > 0 && (
                <button 
                  onClick={() => setUsePoints(!usePoints)}
                  className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${
                    usePoints ? 'bg-gold text-white border-gold' : 'bg-card text-ink/60 border-border hover:border-gold'
                  }`}
                >
                  <Sparkles size={14} />
                  Use Points (-€{(Math.min(user.bonus, Math.floor((estimate?.cost || 0) * 10)) / 10).toFixed(2)})
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleRequest}
                disabled={!destination || isRequesting}
                className={`flex-1 md:flex-none btn-luxury px-10 ${(!destination || isRequesting) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRequesting ? t.requesting : t.requestNow}
              </button>
              <button className="flex-1 md:flex-none btn-outline px-10">{t.schedule}</button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.pickup}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.destination}</label>
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                  <input 
                    type="text" 
                    placeholder={t.whereTo}
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all"
                  />
                </div>
              </div>
            </div>

            {estimate && (
              <div className="space-y-4 pt-4 border-t border-border">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.estCost}</span>
                    <div className="flex flex-col">
                      <span className={`text-xl font-display ${user?.last_game_win ? 'text-ink/40 line-through text-sm' : 'text-gold'}`}>€{estimate.cost.toFixed(2)}</span>
                      {user?.last_game_win && (
                        <span className="text-xl font-display text-gold">€{(estimate.cost * 0.9).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.estTime}</span>
                    <span className="text-xl font-display text-ink">{estimate.time} mins</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.distance}</span>
                    <span className="text-xl font-display text-ink">{estimate.distance}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.traffic}</span>
                    <span className={`text-xl font-display ${estimate.traffic === 'Heavy' ? 'text-red-500' : estimate.traffic === 'Moderate' ? 'text-orange-500' : 'text-emerald-500'}`}>
                      {estimate.traffic}
                    </span>
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Ride Options</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'quiet', label: 'Quiet Ride', icon: <VolumeX size={12} /> },
                      { id: 'luggage', label: 'Extra Luggage', icon: <Briefcase size={12} /> },
                      { id: 'child', label: 'Child Seat', icon: <Baby size={12} /> },
                      { id: 'pet', label: 'Pet Friendly', icon: <Dog size={12} /> }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setRideOptions(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                          rideOptions.includes(opt.id) ? 'bg-gold text-white' : 'bg-paper text-ink/40 hover:bg-paper/80'
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-[500px] rounded-[2.5rem] overflow-hidden shadow-lg border border-border relative group">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${coords?.lng || 12.4964}!3d${coords?.lat || 41.9028}!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!5e0!3m2!1sen!2sit!4v1620000000000!5m2!1sen!2sit`}
            ></iframe>
            
            <AnimatePresence>
              {rideStatus !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 z-20"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-card p-6 sm:p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full space-y-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-display italic text-ink">
                          {rideStatus === 'searching' && t.findingDriver}
                          {rideStatus === 'enroute' && t.driverEnroute}
                          {rideStatus === 'arrived' && t.driverArrived}
                        </h4>
                        <p className="text-xs text-ink/60">
                          {rideStatus === 'searching' && t.connectingPartners}
                          {rideStatus === 'enroute' && `${VEHICLES[selectedCar].name} is 2 minutes away.`}
                          {rideStatus === 'arrived' && t.rideWaiting}
                        </p>
                      </div>
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping" />
                        <div className="relative w-16 h-16 bg-gold rounded-full flex items-center justify-center text-white">
                          {rideStatus === 'searching' ? <Globe className="animate-spin" size={24} /> : <Car size={24} />}
                        </div>
                      </div>
                    </div>

                    {rideStatus !== 'searching' && (
                      <div className="bg-paper/50 p-4 rounded-2xl flex items-center gap-4">
                        <img src={VEHICLES[selectedCar].driver.photo || undefined} alt="Driver" className="w-12 h-12 rounded-full object-cover border-2 border-gold" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-ink">{VEHICLES[selectedCar].driver.name}</span>
                            <div className="flex items-center gap-1 text-gold text-xs">
                              <Star size={10} fill="currentColor" />
                              <span>{VEHICLES[selectedCar].driver.rating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-ink/40 uppercase tracking-widest font-bold">
                            <span>{VEHICLES[selectedCar].name}</span>
                            <span>{VEHICLES[selectedCar].driver.carPlate}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        <span>Progress</span>
                        <span>{rideStatus === 'searching' ? '0%' : rideStatus === 'enroute' ? '65%' : '100%'}</span>
                      </div>
                      <div className="h-1.5 bg-paper rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: rideStatus === 'searching' ? '5%' : rideStatus === 'enroute' ? '65%' : '100%' }}
                          className="h-full bg-gold"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {rideStatus === 'arrived' ? (
                        <button 
                          onClick={() => {
                            setIsRequesting(false);
                            setRideStatus('idle');
                            setDestination('');
                          }}
                          className="w-full btn-luxury py-4"
                        >
                          Finish Ride
                        </button>
                      ) : (
                        <>
                          <button className="flex-1 btn-outline py-3 text-xs flex items-center justify-center gap-2">
                            <MessageSquare size={14} /> Message
                          </button>
                          <button 
                            onClick={() => {
                              setIsRequesting(false);
                              setRideStatus('idle');
                            }}
                            className="flex-1 bg-red-50 text-red-500 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {!coords && (
              <div className="absolute inset-0 bg-paper/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-ink text-white rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <MapPin size={24} />
                  </div>
                  <p className="font-medium text-ink">Locating you in Italy...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-display italic text-ink">Select Vehicle</h3>
          <div className="space-y-4">
            {filteredVehicles.map((v, i) => (
              <motion.div 
                key={v.id} 
                whileHover={{ x: 5 }}
                onClick={() => setSelectedCar(v.id)}
                className={`luxury-card p-4 flex flex-col gap-4 cursor-pointer transition-all border-2 ${selectedCar === v.id ? 'border-gold shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-paper rounded-xl overflow-hidden">
                      <img src={v.image || undefined} alt={v.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink">{v.name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                        {v.company}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-ink">Base €{v.basePrice}</p>
                    <p className="text-[10px] text-ink/40">
                      {t.luxuryTier}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-[10px] text-ink/60">
                    {v.type}
                  </span>
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: v.stars }).map((_, j) => (
                      <Star key={j} size={10} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredVehicles.length === 0 && (
              <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
                <p className="text-ink/40 italic">No vehicles match your rating criteria.</p>
              </div>
            )}
          </div>

          <div className="bg-ink p-8 rounded-[2rem] text-white space-y-4 shadow-xl">
            <h4 className="text-xl font-display italic">Why ItaliaGo?</h4>
            <ul className="space-y-3 text-sm font-light opacity-80">
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Professional Chauffeurs</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Real-time Tracking</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Complimentary Refreshments</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Multi-lingual Support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Suggestions t={t} />
      </div>
    </div>
  );
}



