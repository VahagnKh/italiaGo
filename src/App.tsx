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
  Send
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

import { useLanguage } from './contexts/LanguageContext';
import AdminView from './components/AdminView';
import AIConcierge from './components/AIConcierge';
import TranslatedText from './components/TranslatedText';

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
  const [view, setView] = useState<'home' | 'checkout' | 'hotels' | 'restaurants' | 'tours' | 'taxi' | 'experiences' | 'rentals' | 'events' | 'overview' | 'inbox' | 'lessons' | 'tasks' | 'groups' | 'friends' | 'settings'>('home');
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
  const [notifications, setNotifications] = useState<{ id: string, message: string, type: 'success' | 'info' | 'error' }[]>([]);
  const [infoModal, setInfoModal] = useState<{ title: string, content: string } | null>(null);
  const [listings, setListings] = useState<any[]>([]);

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUser(data);
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
    if (user && view === 'home') {
      setView('overview');
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
      {user && view !== 'home' && view !== 'checkout' ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar view={view} setView={setView} user={user} setUser={setUser} setShowAdmin={setShowAdmin} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar setView={setView} user={user} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
              {view === 'overview' && <DashboardHome user={user} setView={setView} />}
              {view === 'inbox' && <InboxView user={user} />}
              {view === 'lessons' && <LessonsView user={user} />}
              {view === 'tasks' && <TasksView user={user} />}
              {view === 'groups' && <GroupsView user={user} />}
              {view === 'friends' && <FriendsView user={user} />}
              {view === 'settings' && <SettingsView user={user} setUser={setUser} />}
              
              {/* Fallback for old views if needed */}
              {['hotels', 'restaurants', 'experiences', 'tours', 'rentals', 'events', 'taxi'].includes(view) && (
                <div className="max-w-7xl mx-auto">
                   <button onClick={() => setView('overview')} className="mb-4 flex items-center gap-2 text-ink/60 hover:text-ink transition-colors">
                     <ArrowLeft size={16} /> Back to Dashboard
                   </button>
                   {view === 'hotels' && <ListView items={HOTELS} type="hotel" title={t.hotels} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'restaurants' && <ListView items={RESTAURANTS} type="restaurant" title={t.restaurants} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'experiences' && <ListView items={EXPERIENCES} type="experience" title={t.experiences} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
                   {view === 'tours' && <ListView items={TOURS} type="tour" title={t.tours} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} user={user} initialFilter={initialFilter} initialPriceFilter={initialPriceFilter} initialSearch={initialSearch} />}
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
          <button onClick={() => { setView('hotels'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'hotels' ? 'text-ink' : ''}`}>{t.hotels}</button>
          <button onClick={() => { setView('restaurants'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'restaurants' ? 'text-ink' : ''}`}>{t.restaurants}</button>
          <button onClick={() => { setView('experiences'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'experiences' ? 'text-ink' : ''}`}>{t.experiences}</button>
          <button onClick={() => { setView('tours'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'tours' ? 'text-ink' : ''}`}>{t.tours}</button>
          <button onClick={() => { setView('rentals'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'rentals' ? 'text-ink' : ''}`}>{t.rentals}</button>
          <button onClick={() => { setView('events'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'events' ? 'text-ink' : ''}`}>{t.events}</button>
          <button onClick={() => { setView('taxi'); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className={`hover:text-ink transition-colors ${view === 'taxi' ? 'text-ink' : ''}`}>{t.taxi}</button>
          {(user?.role === 'admin' || user?.name === 'Marco Rossi') && (
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
              <button onClick={() => { setView('hotels'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.hotels}</button>
              <button onClick={() => { setView('restaurants'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.restaurants}</button>
              <button onClick={() => { setView('experiences'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.experiences}</button>
              <button onClick={() => { setView('tours'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.tours}</button>
              <button onClick={() => { setView('rentals'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.rentals}</button>
              <button onClick={() => { setView('events'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.events}</button>
              <button onClick={() => { setView('taxi'); setShowMobileMenu(false); setInitialFilter('all'); setInitialPriceFilter('all'); setInitialSearch(''); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.taxi}</button>
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
                        onClick={() => { setLang(l.code); setShowLangMenu(false); }}
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
                            onClick={() => { setUser(null); setShowProfileMenu(false); }}
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
        {view === 'home' && <HomeView setView={setView} t={t} lang={lang} setInfoModal={setInfoModal} setInitialFilter={setInitialFilter} addNotification={addNotification} />}
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
            onSuccess={(userData) => {
              setUser(userData);
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
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://picsum.photos/seed/italy-hero/1920/1080" 
          alt="Italy" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white space-y-6 px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-6xl md:text-8xl font-display italic leading-tight"
          >
            {t.discover}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl font-light tracking-wide opacity-90"
          >
            {t.companion}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-8"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0px 0px 0px rgba(212, 175, 55, 0)", "0px 0px 20px rgba(212, 175, 55, 0.3)", "0px 0px 0px rgba(212, 175, 55, 0)"]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onClick={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} 
              className="group px-10 py-4 bg-ink text-paper rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl flex items-center gap-3 mx-auto"
            >
              {t.start}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {[
          { icon: Hotel, label: t.hotels, color: 'bg-blue-50 dark:bg-blue-900/20', view: 'hotels' },
          { icon: Utensils, label: t.restaurants, color: 'bg-orange-50 dark:bg-orange-900/20', view: 'restaurants' },
          { icon: Sparkles, label: t.experiences, color: 'bg-yellow-50 dark:bg-yellow-900/20', view: 'experiences' },
          { icon: Compass, label: t.tours, color: 'bg-emerald-50 dark:bg-emerald-900/20', view: 'tours' },
          { icon: Car, label: t.rentals, color: 'bg-red-50 dark:bg-red-900/20', view: 'rentals' },
          { icon: MapIcon, label: t.taxi, color: 'bg-purple-50 dark:bg-purple-900/20', view: 'taxi' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            onClick={() => setView(item.view as any)}
            className="luxury-card p-8 flex flex-col items-center text-center space-y-4 cursor-pointer"
          >
            <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-ink`}>
              <item.icon size={32} />
            </div>
            <h3 className="font-bold text-lg uppercase tracking-widest text-ink">{item.label}</h3>
          </motion.div>
        ))}
      </section>

      {/* Suggestions */}
      <section className="max-w-7xl mx-auto px-6">
        <Suggestions t={t} />
      </section>

      {/* Destinations */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-display italic text-ink">{t.featured}</h2>
            <p className="text-ink/60 italic">Handpicked escapes for the discerning traveler.</p>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-outline flex items-center gap-2">
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setInitialFilter(dest.name);
                setView('hotels');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative h-[500px] rounded-3xl overflow-hidden shadow-lg cursor-pointer"
            >
              <img src={dest.image || undefined} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-8 text-white space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{dest.tagline}</span>
                <h3 className="text-3xl font-display">{dest.name}</h3>
                <p className="text-sm opacity-80 font-light leading-relaxed">
                  <TranslatedText text={dest.description} lang={lang} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section className="bg-paper py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-display italic">{t.stories}</h2>
            <p className="text-ink/60 italic max-w-2xl mx-auto">Discover Italy through the eyes of fellow travelers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STORIES.map((story) => (
              <motion.div 
                key={story.id}
                className="space-y-6 group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-3xl">
                  <img src={story.image || undefined} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold">By {story.author}</p>
                  <h3 className="text-2xl font-display italic group-hover:text-gold transition-colors">{story.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed line-clamp-3">
                    <TranslatedText text={story.excerpt} lang={lang} />
                  </p>
                  <button 
                    onClick={() => setInfoModal({ title: story.title, content: story.excerpt + " ... Full story coming soon to ItaliaGo Magazine." })}
                    className="text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all"
                  >
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-ink rounded-[3rem] p-12 md:p-24 text-center text-white space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="https://picsum.photos/seed/newsletter-bg/1920/1080" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display italic">Join the Inner Circle</h2>
            <p className="text-white/60 text-lg font-light">Receive exclusive offers, travel tips, and early access to new experiences.</p>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <input type="email" placeholder="Your email address" className="flex-1 bg-white/10 border border-white/20 rounded-full px-8 py-4 outline-none focus:ring-2 focus:ring-gold transition-all" />
              <button 
                onClick={() => addNotification('Welcome to the Inner Circle!', 'success')}
                className="btn-luxury px-12 py-4"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
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
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []));
    
    fetch('/api/offers')
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
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl text-ink">Bentornato, {user.name}</h1>
          <p className="text-sm sm:text-base text-ink/60">Manage your bookings and rewards.</p>
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
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'favorites' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          Favorites ({favorites.length})
        </button>
        <button 
          onClick={() => setActiveTab('market')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'market' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          Bonus Market
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
          Profile
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
              <h2 className="text-2xl font-display italic text-ink">Recent Bookings</h2>
              <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="bg-paper/50 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map((booking, i) => (
                        <tr key={i} className="hover:bg-paper/30 transition-colors">
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
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm text-ink">
                            €{booking.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-ink/40 italic">
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
              <h2 className="text-2xl font-display italic text-ink">Your Favorites</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favorites.map((item, i) => (
                  <div key={i} className="luxury-card group">
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
              <h2 className="text-2xl font-display italic text-ink">Bonus Market</h2>
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
                fetch('/api/game-win', { method: 'POST' }).then(() => refreshUser());
              }} 
            />
          )}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-display italic text-ink">Profile Settings</h2>
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
                        {avatars.map((av, i) => (
                          <button 
                            key={i}
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
    </div>
  );
}


function Sidebar({ view, setView, user, setUser, setShowAdmin }: { view: string, setView: (v: any) => void, user: any, setUser: (u: any) => void, setShowAdmin: (s: boolean) => void }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'lessons', label: 'Lesson', icon: BookOpen },
    { id: 'tasks', label: 'Task', icon: CheckSquare },
    { id: 'groups', label: 'Group', icon: Users },
  ];

  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/friends')
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-full p-6">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white">
          <Sparkles size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 uppercase">Coursue</span>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-4">Overview</p>
          <div className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  view === item.id ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-4">Friends</p>
          <div className="space-y-4 px-4">
            {friends.map((friend, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                  <img src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{friend.name}</p>
                  <p className="text-[10px] text-gray-400">{friend.role}</p>
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <p className="text-[10px] italic text-gray-400">No friends yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-4">Settings</p>
        <button
          onClick={() => setView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            view === 'settings' ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          }`}
        >
          <Settings size={18} />
          Settings
        </button>
        {user.role === 'admin' && (
          <button
            onClick={() => setShowAdmin(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gold hover:bg-gold/5 transition-all"
          >
            <Shield size={18} />
            Admin Panel
          </button>
        )}
        <button
          onClick={() => { setUser(null); setView('home'); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

function TopBar({ setView, user }: { setView: (v: any) => void, user: any }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (query.length > 2) {
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(data => setResults(data));
    } else {
      setResults(null);
    }
  }, [query]);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search your course here...."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-12 py-3 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <Filter size={18} />
        </button>

        {results && results.courses && results.mentors && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="p-4 space-y-4">
              {results.courses.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Courses</p>
                  <div className="space-y-2">
                    {results.courses.map((c: any) => (
                      <button key={c.id} className="w-full text-left p-2 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">{c.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {results.mentors.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mentors</p>
                  <div className="space-y-2">
                    {results.mentors.map((m: any) => (
                      <button key={m.id} className="w-full text-left p-2 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="h-8 w-px bg-gray-100 mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{user.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role}</p>
          </div>
          <button onClick={() => setView('settings')} className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardHome({ user, setView }: { user: any, setView: (v: any) => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []));
    
    fetch('/api/user/progress')
      .then(res => res.json())
      .then(data => setProgress(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="space-y-10">
      {/* Banner */}
      <div className="relative bg-[#7C3AED] rounded-[2.5rem] p-8 sm:p-12 overflow-hidden text-white">
        <div className="relative z-10 max-w-lg space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Online Course</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">Sharpen Your Skills With Professional Online Courses</h1>
          <button 
            onClick={() => setView('lessons')}
            className="bg-white text-[#7C3AED] px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            Join Now <Play size={16} fill="currentColor" />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-2xl flex items-center justify-center text-[#7C3AED]">
                <Bell size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2/8 Watched</p>
                <p className="text-sm font-bold text-gray-900">Product Design</p>
              </div>
            </div>
            <button className="text-gray-300 group-hover:text-gray-600 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Continue Watching */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Continue Watching</h2>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 group hover:shadow-xl transition-all">
              <div className="h-48 relative overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">
                  {course.category}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{course.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} alt={course.instructor} />
                  </div>
                  <span className="text-xs text-gray-400">{course.instructor}</span>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex-1 mr-4">
                     <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#7C3AED]" style={{ width: '45%' }} />
                     </div>
                   </div>
                   <button onClick={() => setView('lessons')} className="text-[#7C3AED] hover:underline text-xs font-bold">Continue</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentors Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-8 flex justify-between items-center border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Your Mentor</h2>
          <button className="text-[#7C3AED] text-xs font-bold hover:underline">See All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-8 py-6">Instructor Name & Date</th>
                <th className="px-8 py-6">Course Type</th>
                <th className="px-8 py-6">Course Title</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2].map(i => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor${i}`} alt="Mentor" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Prashant Kumar Singh</p>
                        <p className="text-[10px] text-gray-400">25/2/2023</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full text-[10px] font-bold uppercase tracking-widest">Frontend</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-gray-600">Understanding Concept Of React</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[#7C3AED] text-xs font-bold bg-[#7C3AED]/10 px-4 py-2 rounded-xl hover:bg-[#7C3AED] hover:text-white transition-all">Show Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ user }: { user: any }) {
  const [mentors, setMentors] = useState<any[]>([]);
  const data = [
    { name: 'Mon', value: 30 },
    { name: 'Tue', value: 45 },
    { name: 'Wed', value: 60 },
    { name: 'Thu', value: 40 },
    { name: 'Fri', value: 80 },
    { name: 'Sat', value: 95 },
    { name: 'Sun', value: 50 },
  ];

  useEffect(() => {
    fetch('/api/mentors')
      .then(res => res.json())
      .then(data => setMentors(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleFollow = (id: number) => {
    fetch('/api/mentors/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId: id })
    })
    .then(res => res.json())
    .then(data => {
      setMentors(prev => prev.map(m => m.id === id ? { ...m, isFollowed: data.followed } : m));
    });
  };

  return (
    <div className="hidden xl:flex flex-col w-80 bg-white border-l border-gray-100 h-full p-8 overflow-y-auto space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Your Profile</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full p-1 border-2 border-[#7C3AED] border-t-transparent animate-spin-slow">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
              <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Good Morning {user.name.split(' ')[0]}</h3>
          <p className="text-xs text-gray-400 mt-1">Continue Your Journey And Achieve Your Target</p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
          <Bell size={18} />
        </button>
        <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
          <ShoppingBag size={18} />
        </button>
        <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
          <Mail size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 rounded-lg shadow-xl border border-gray-100 text-[10px] font-bold">
                        {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? '#7C3AED' : '#E5E7EB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
          <span>Learning Progress</span>
          <span className="text-[#7C3AED]">75%</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Your Mentor</h2>
          <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-4">
          {mentors.map((mentor, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{mentor.name}</p>
                  <p className="text-[10px] text-gray-400">{mentor.role}</p>
                </div>
              </div>
              <button 
                onClick={() => handleFollow(mentor.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  mentor.isFollowed ? 'bg-gray-100 text-gray-400' : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                }`}
              >
                {mentor.isFollowed ? 'Followed' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
        <button className="w-full py-3 bg-[#7C3AED]/10 text-[#7C3AED] rounded-2xl text-xs font-bold hover:bg-[#7C3AED] hover:text-white transition-all">
          See All
        </button>
      </div>
    </div>
  );
}

function InboxView({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []));
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: 1, content }) // Simplified: send to admin/mentor 1
    })
    .then(() => {
      setContent('');
      fetch('/api/messages').then(res => res.json()).then(data => setMessages(Array.isArray(data) ? data : []));
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
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.sender_id === user.id ? 'flex-row-reverse' : ''}`}>
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

function LessonsView({ user }: { user: any }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []));
  }, []);

  const fetchCourseDetails = (id: number) => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => setSelectedCourse(data));
  };

  if (selectedCourse) {
    return (
      <div className="space-y-8">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Back to Courses
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <iframe
                src={selectedCourse.lessons[0]?.video_url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h1>
                  <p className="text-gray-400 mt-1">{selectedCourse.instructor}</p>
                </div>
                <span className="px-4 py-2 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full text-xs font-bold uppercase tracking-widest">
                  {selectedCourse.category}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">{selectedCourse.description}</p>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col h-fit">
            <div className="p-6 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Course Content</h3>
              <p className="text-xs text-gray-400 mt-1">{selectedCourse.lessons.length} Lessons • 2h 45m</p>
            </div>
            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px]">
              {selectedCourse.lessons.map((lesson: any, i: number) => (
                <button key={i} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#7C3AED] group-hover:text-white transition-all">
                    {i === 0 ? <Play size={18} fill="currentColor" /> : <Lock size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{lesson.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{lesson.duration}</p>
                  </div>
                  {i === 0 && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Playing</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">My Lessons</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all flex flex-col">
            <div className="h-56 relative overflow-hidden">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button onClick={() => fetchCourseDetails(course.id)} className="w-16 h-16 bg-white text-[#7C3AED] rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all">
                  <Play size={32} fill="currentColor" />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6 flex-1 flex flex-col">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest">{course.category}</span>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{course.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} alt={course.instructor} />
                </div>
                <span className="text-xs text-gray-400">{course.instructor}</span>
              </div>
              <div className="pt-6 border-t border-gray-50 mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                  <span className="text-[10px] font-bold text-[#7C3AED]">45%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7C3AED]" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksView({ user }: { user: any }) {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">All Tasks</button>
          <button className="px-4 py-2 bg-[#7C3AED] rounded-xl text-xs font-bold text-white shadow-lg shadow-[#7C3AED]/20">Pending</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {tasks.map((task, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group hover:shadow-xl transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-all">
                <CheckSquare size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-400">{task.course_title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Clock size={12} /> Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    task.status === 'submitted' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    {task.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-8 py-4 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all">View Details</button>
              <button className="flex-1 md:flex-none px-8 py-4 bg-[#7C3AED] text-white rounded-2xl text-xs font-bold hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20">Submit Task</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <CheckSquare size={64} className="mx-auto text-gray-100" />
            <p className="text-gray-400 italic">No assignments found for your courses.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupsView({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Learning Groups</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-6 group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 bg-[#7C3AED]/10 rounded-[1.5rem] flex items-center justify-center text-[#7C3AED]">
                <Users size={32} />
              </div>
              <button className="text-gray-300 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">React Enthusiasts</h3>
              <p className="text-sm text-gray-400">A group for sharing React tips and tricks.</p>
            </div>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${j}`} alt="Member" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                +12
              </div>
            </div>
            <button className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-[#7C3AED] hover:text-white transition-all">Join Group</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FriendsView({ user }: { user: any }) {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/friends')
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">My Friends</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {friends.map((friend, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 text-center space-y-6 group hover:shadow-xl transition-all">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg">
                <img src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{friend.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{friend.role}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] transition-all">
                <MessageSquare size={18} className="mx-auto" />
              </button>
              <button className="flex-1 p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                <Trash2 size={18} className="mx-auto" />
              </button>
            </div>
          </div>
        ))}
        <button className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center space-y-4 hover:border-[#7C3AED] hover:bg-[#7C3AED]/5 transition-all group">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 group-hover:bg-[#7C3AED] group-hover:text-white transition-all">
            <Users size={32} />
          </div>
          <p className="text-sm font-bold text-gray-400 group-hover:text-[#7C3AED]">Add New Friend</p>
        </button>
      </div>
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
    fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    for (let i = 0; i < basket.length; i++) {
      const item = basket[i];
      const itemPoints = i === basket.length - 1 ? remainingPoints : Math.min(remainingPoints, Math.floor(item.price * 10));
      remainingPoints -= itemPoints;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

function ReviewsSection({ itemId, t, lang, user }: { itemId: string, t: any, lang: string, user: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews/${itemId}`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []));
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, rating, comment, userId: user?.id })
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

  const locations = ['all', ...Array.from(new Set(items.map(item => item.location)))];
  const priceLevels = ['all', 'low', 'medium', 'high'];
  const starLevels = ['all', 3, 4, 5];

  const filteredItems = items.filter(item => {
    const locMatch = filter === 'all' || (item.location || '') === filter;
    const priceMatch = priceFilter === 'all' || (item.price_level || '') === priceFilter;
    const starMatch = starFilter === 'all' || (item.stars || 0) === starFilter;
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
        {filteredItems.map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            className="luxury-card group cursor-pointer"
          >
            <div className="h-64 overflow-hidden relative">
              <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4">
                <div className="bg-card/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                  {Array.from({ length: item.stars }).map((_, j) => (
                    <Star key={j} size={10} fill="currentColor" className="text-gold" />
                  ))}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                  favorites.some(f => f.id === item.id) 
                    ? 'bg-red-500 text-white' 
                    : 'bg-card/90 backdrop-blur text-ink/40 hover:text-red-500'
                }`}
              >
                <Heart size={14} fill={favorites.some(f => f.id === item.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="p-6 space-y-4 bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-display text-ink">{item.name}</h3>
                  <p className="text-sm text-ink/60 flex items-center gap-1">
                    <MapPin size={12} /> {item.location}
                  </p>
                </div>
                {item.price && <span className="font-bold text-ink">€{item.price}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedItem(item)} className="flex-1 btn-outline text-xs py-2">{t.more}</button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToBasket(item); }}
                  className="flex-1 btn-luxury text-xs py-2"
                >
                  {t.addToBasket}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
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
                      {selectedItem.amenities.map((a: string) => (
                        <span key={a} className="px-3 py-1 bg-paper rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <TranslatedText text={a} lang={lang} />
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedItem.highlights && (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.highlights.map((h: string) => (
                        <span key={h} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          <TranslatedText text={h} lang={lang} />
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-2">Heritage & Info</h4>
                    <p className="text-sm text-ink/60 italic leading-relaxed">
                      <TranslatedText text={selectedItem.history || selectedItem.info || ''} lang={lang} />
                    </p>
                  </div>

                  {(type === 'hotel' || type === 'restaurant') && (
                    <ReviewsSection itemId={selectedItem.id} t={t} lang={lang} user={user} />
                  )}

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
    fetch('/api/suggestions')
      .then(res => res.json())
      .then(data => setSuggestions(Array.isArray(data) ? data : []));
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
            key={item.id}
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
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

function AuthModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const body = mode === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-card rounded-[2rem] overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 mx-4"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-display italic text-ink">
            {mode === 'login' ? 'Welcome Back' : 'Join ItaliaGo'}
          </h2>
          <p className="text-ink/60 text-sm">
            {mode === 'login' ? 'Sign in to access your luxury travel suite.' : 'Create an account for exclusive Italian experiences.'}
          </p>
        </div>

        <div className="flex p-1 bg-paper rounded-full">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-card shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-card shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-luxury py-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <button 
          onClick={onClose}
          className="w-full text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

