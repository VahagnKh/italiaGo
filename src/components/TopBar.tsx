import React, { useState } from 'react';
import { Search, Bell, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  setView: (view: any) => void;
}

const TopBar: React.FC<TopBarProps> = ({ setView }) => {
  const { t } = useLanguage();
  const { user, userData } = useAuth();
  const [query, setQuery] = useState('');

  if (!user) return null;

  return (
    <header className="bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100">
      <div className="flex-1 max-w-xl">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {t.welcomeBack}, {userData?.name?.split(' ')[0] || user.displayName?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">{t.manageBookings}</p>
      </div>

      <div className="relative flex-1 max-w-md mx-8 hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search destination, hotel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-accent/20 text-sm transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-4">
          <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
          </button>
          <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
            <Mail size={18} />
          </button>
        </div>
        
        <div className="h-8 w-px bg-gray-100 mx-2" />
        
        <button onClick={() => setView('profile')} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-2xl transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-none">{userData?.name || user.displayName || 'User'}</p>
            <p className="text-[9px] uppercase tracking-widest text-accent font-bold mt-1 leading-none">{userData?.role || 'User'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
            <img 
              src={userData?.avatar_url || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || user.displayName || 'User'}`} 
              alt={userData?.name || user.displayName || 'User'} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
