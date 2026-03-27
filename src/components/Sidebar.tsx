import React from 'react';
import { 
  Map as MapIcon, Mail, Bell, Heart, User, Settings, Plane, Shield, LogOut, CheckSquare 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  view: string;
  setView: (view: any) => void;
  setShowAdmin: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, setShowAdmin }) => {
  const { t } = useLanguage();
  const { user, userData, logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: t.destinations, icon: MapIcon },
    { id: 'inbox', label: t.messages, icon: Mail },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'favorites', label: t.savedPlaces, icon: Heart },
    { id: 'profile', label: t.account, icon: User },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  if (!user) return null;

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white h-full p-6 border-r border-gray-100">
      <div className="flex items-center gap-3 mb-12 px-4">
        <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white">
          <Plane size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">Tourvisto</span>
      </div>

      <div className="space-y-2 flex-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
              view === item.id ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8 space-y-4">
        <div className="bg-[#7C3AED]/5 rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
          <div className="relative z-10 space-y-2">
            <p className="text-sm font-bold text-gray-900">{t.upgradePro}</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">{t.upgradeDesc}</p>
            <button className="mt-2 text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest">{t.learnMore}</button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#7C3AED]/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
        </div>

        <div className="space-y-1">
          {userData?.role === 'admin' && (
            <button
              onClick={() => setShowAdmin(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-gold hover:bg-gold/5 transition-all"
            >
              <Shield size={20} />
              {t.admin}
            </button>
          )}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
