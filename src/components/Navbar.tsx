import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Bell, MessageSquare, Search, Menu, X, 
  Sparkles, ShoppingBag, Globe, LogOut, Shield,
  ChevronDown, CheckSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBasket } from '../contexts/BasketContext';
import { useNotifications } from '../contexts/NotificationContext';

interface NavbarProps {
  onAuthClick: () => void;
  onAIClick: () => void;
  onAdminClick: () => void;
  setView?: (view: any) => void;
  currentView?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthClick, onAIClick, onAdminClick, setView, currentView }) => {
  const { user, userData, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { basket } = useBasket();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Discover', path: '/discover', view: 'discover' },
    { name: t.hotels, path: '/hotels', view: 'hotels' },
    { name: t.restaurants, path: '/restaurants', view: 'restaurants' },
    { name: t.experiences, path: '/experiences', view: 'experiences' },
    { name: t.tours, path: '/tours', view: 'tours' },
    { name: t.rentals, path: '/rentals', view: 'rentals' },
    { name: t.events, path: '/events', view: 'events' },
  ];

  const handleNavClick = (link: any) => {
    if (setView) {
      setView(link.view);
      setIsMobileMenuOpen(false);
    } else {
      navigate(link.path);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    if (setView) setView('home');
    else navigate('/');
    setShowUserMenu(false);
  };

  const isAdmin = userData?.role === 'admin';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] py-4' 
        : 'bg-transparent py-8'
    }`}>
      <div className="max-w-[1800px] mx-auto px-6 sm:px-12 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          layout
          onClick={() => setView ? setView('home') : navigate('/')} 
          className="flex items-center gap-4 group cursor-pointer"
        >
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className={`w-12 h-12 flex items-center justify-center font-display text-3xl italic rounded-2xl shadow-2xl transition-all duration-500 ${
              isScrolled ? 'bg-ink text-paper' : 'bg-white text-ink'
            }`}
          >
            I
          </motion.div>
          <div className="flex flex-col">
            <span className={`text-2xl font-display italic tracking-tight leading-none transition-colors duration-500 ${isScrolled ? 'text-ink' : 'text-white'}`}>
              Italia<span className="text-gold">Go</span>
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-[0.4em] mt-1.5 transition-colors duration-500 ${isScrolled ? 'text-ink/40' : 'text-white/40'}`}>
              Luxury Travel
            </span>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link, idx) => (
            <motion.button 
              key={link.view}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              onClick={() => handleNavClick(link)}
              className={`relative text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 group py-2 ${
                (currentView === link.view || location.pathname === link.path)
                  ? 'text-gold' 
                  : isScrolled ? 'text-ink/70 hover:text-ink' : 'text-white/70 hover:text-white'
              }`}
            >
              {link.name}
              <motion.span 
                layoutId="navUnderline"
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-gold origin-left transition-transform duration-500 ${
                  (currentView === link.view || location.pathname === link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} 
              />
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'it' : 'en')}
            className={`hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-500 border ${
              isScrolled 
                ? 'border-ink/10 text-ink hover:bg-ink hover:text-paper' 
                : 'border-white/20 text-white hover:bg-white/10'
            }`}
          >
            <Globe size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {language === 'en' ? 'IT' : 'EN'}
            </span>
          </button>

          {/* AI Concierge Trigger */}
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAIClick}
            className="relative px-6 py-3 rounded-xl bg-ink text-paper text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl overflow-hidden group hidden md:block"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              <Sparkles size={14} className="text-gold" />
              AI Concierge
            </span>
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
            />
          </motion.button>

          {/* Basket */}
          <button 
            onClick={() => setView ? setView('checkout') : navigate('/checkout')}
            className={`relative p-3 rounded-full transition-all duration-500 hover:scale-110 border ${
              isScrolled 
                ? 'border-ink/10 text-ink hover:bg-ink hover:text-paper' 
                : 'border-white/20 text-white hover:bg-white/10'
            }`}
          >
            <ShoppingBag size={18} />
            {basket.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xl"
              >
                {basket.length}
              </motion.span>
            )}
          </button>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-4 p-1.5 pr-5 rounded-full transition-all duration-500 hover:shadow-xl border ${
                  isScrolled ? 'bg-white text-ink border-ink/5' : 'bg-white/10 text-white backdrop-blur-xl border-white/20'
                }`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold shadow-lg">
                  <img 
                    src={userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                    alt={userData?.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {userData?.name?.split(' ')[0] || 'Profile'}
                  </span>
                  <ChevronDown size={12} className="opacity-40" />
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute right-0 mt-6 w-72 bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-ink/5 overflow-hidden p-3"
                    >
                      <div className="p-6 border-b border-ink/5 bg-paper/30 rounded-t-[2rem] mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30 mb-2">Authenticated as</p>
                        <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <button 
                          onClick={() => { handleNavClick({ view: 'dashboard' }); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-paper transition-all text-ink group"
                        >
                          <div className="w-10 h-10 bg-gold/10 text-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={20} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                        </button>
                        <button 
                          onClick={() => { handleNavClick({ view: 'tasks' }); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-paper transition-all text-ink group"
                        >
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckSquare size={20} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">Tasks</span>
                        </button>
                        <button 
                          onClick={() => { handleNavClick({ view: 'messages' }); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-paper transition-all text-ink group"
                        >
                          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageSquare size={20} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">Messages</span>
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => { onAdminClick(); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-paper transition-all text-gold group"
                          >
                            <div className="w-10 h-10 bg-gold/10 text-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Shield size={20} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
                          </button>
                        )}
                        <div className="h-px bg-ink/5 my-2 mx-4" />
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-all text-red-500 group"
                        >
                          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LogOut size={20} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAuthClick}
              className={`px-10 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-2xl ${
                isScrolled ? 'bg-ink text-paper hover:bg-gold hover:text-white' : 'bg-white text-ink hover:bg-gold hover:text-white'
              }`}
            >
              {t.login}
            </motion.button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-3 rounded-full border transition-all duration-500 ${
              isScrolled ? 'border-ink/10 text-ink hover:bg-paper' : 'border-white/20 text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-ink/95 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center p-12"
          >
            <div className="flex flex-col items-center gap-8 text-center">
              {navLinks.map((link, idx) => (
                <motion.button 
                  key={link.view}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleNavClick(link)}
                  className="text-4xl font-display italic text-white hover:text-gold transition-colors"
                >
                  {link.name}
                </motion.button>
              ))}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-20 h-px bg-white/20 my-4" 
              />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col gap-6 w-full max-w-xs"
              >
                <button onClick={onAIClick} className="btn-luxury w-full py-5 text-sm">AI Concierge</button>
                {!user && <button onClick={onAuthClick} className="btn-outline w-full py-5 text-sm border-white text-white hover:bg-white hover:text-ink">Sign In</button>}
              </motion.div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-10 right-10 p-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
