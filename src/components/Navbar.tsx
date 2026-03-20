import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, MessageSquare, Search, Menu, X, 
  Sparkles, ShoppingBag, Globe, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBasket } from '../contexts/BasketContext';
import { useNotifications } from '../contexts/NotificationContext';

interface NavbarProps {
  onAuthClick: () => void;
  onAIClick: () => void;
  onAdminClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthClick, onAIClick, onAdminClick }) => {
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.hotels, path: '/hotels' },
    { name: t.restaurants, path: '/restaurants' },
    { name: t.experiences, path: '/experiences' },
    { name: t.tours, path: '/tours' },
    { name: t.rentals, path: '/rentals' },
    { name: t.events, path: '/events' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const isAdmin = userData?.role === 'admin';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-ink text-paper rounded-xl flex items-center justify-center font-display text-2xl italic group-hover:scale-110 transition-transform">
            I
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-display italic tracking-tight leading-none ${isScrolled ? 'text-ink' : 'text-white'}`}>
              Italia<span className="text-gold">Go</span>
            </span>
            <span className={`text-[8px] font-bold uppercase tracking-[0.3em] ${isScrolled ? 'text-ink/40' : 'text-white/40'}`}>
              Luxury Travel
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path}
              className={`text-[10px] font-bold uppercase tracking-widest transition-all hover:text-gold ${
                location.pathname === link.path 
                  ? 'text-gold' 
                  : isScrolled ? 'text-ink' : 'text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'it' : 'en')}
            className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
              isScrolled ? 'hover:bg-paper text-ink' : 'hover:bg-white/10 text-white'
            }`}
          >
            <Globe size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
              {language === 'en' ? 'IT' : 'EN'}
            </span>
          </button>

          {/* AI Concierge Trigger */}
          <button 
            onClick={onAIClick}
            className="relative p-2 rounded-full bg-gold text-white shadow-lg hover:scale-110 transition-transform group"
          >
            <Sparkles size={18} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            <div className="absolute top-full mt-2 right-0 bg-ink text-paper text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              AI Concierge
            </div>
          </button>

          {/* Basket */}
          <Link 
            to="/checkout"
            className={`relative p-2 rounded-full transition-colors ${
              isScrolled ? 'hover:bg-paper text-ink' : 'hover:bg-white/10 text-white'
            }`}
          >
            <ShoppingBag size={18} />
            {basket.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {basket.length}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-3 p-1 pr-3 rounded-full transition-all ${
                  isScrolled ? 'bg-paper text-ink' : 'bg-white/10 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold/30">
                  <img 
                    src={userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                    alt={userData?.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                  {userData?.name?.split(' ')[0] || 'Profile'}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[-1]" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-64 bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
                    >
                      <div className="p-6 border-b border-border bg-paper/50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Authenticated as</p>
                        <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link 
                          to="/dashboard" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-paper transition-colors text-ink group"
                        >
                          <div className="w-8 h-8 bg-gold/10 text-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                        </Link>
                        <Link 
                          to="/dashboard/inbox" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-paper transition-colors text-ink group"
                        >
                          <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageSquare size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">Messages</span>
                        </Link>
                        {isAdmin && (
                          <button 
                            onClick={() => { onAdminClick(); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-paper transition-colors text-ink group"
                          >
                            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Shield size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
                          </button>
                        )}
                      </div>
                      <div className="p-2 border-t border-border">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 transition-colors text-red-500 group"
                        >
                          <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LogOut size={16} />
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
            <button 
              onClick={onAuthClick}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                isScrolled ? 'bg-ink text-paper hover:bg-ink/90' : 'bg-white text-ink hover:bg-white/90'
              }`}
            >
              {t.login}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-full ${
              isScrolled ? 'text-ink hover:bg-paper' : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold uppercase tracking-widest text-ink hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
