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
    <header className="bg-white px-8 py-6 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100">
      <div className="flex-1 max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900">{t.welcomeBack}, {userData?.name?.split(' ')[0] || user.displayName?.split(' ')[0] || 'User'} 👋</h1>
        <p className="text-xs text-gray-400 mt-1">{t.manageBookings}</p>
      </div>

      <div className="relative flex-1 max-w-md mx-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search destination, hotel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-colors">
          <Mail size={20} />
        </button>
        <div className="h-10 w-px bg-gray-100 mx-2" />
        <button onClick={() => setView('profile')} className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
          <img src={userData?.avatar_url || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || user.displayName || 'User'}`} alt={userData?.name || user.displayName || 'User'} className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
