import React from 'react';
import { 
  Map as MapIcon, Mail, Bell, Heart, User, Settings, Plane, Shield, LogOut, CheckSquare, Home, LayoutDashboard 
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
    { id: 'home', label: 'Main Page', icon: Home },
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover', label: 'Places', icon: MapIcon },
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
      <div className="flex items-center gap-3 mb-10 px-4">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
          <Plane size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">ItaliaGo</span>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full sidebar-item ${
              view === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 space-y-4">
        <div className="bg-accent-light rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
          <div className="relative z-10 space-y-2">
            <p className="text-sm font-bold text-gray-900">Upgrade to Pro</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">Unlock premium features and exclusive deals.</p>
            <button className="mt-2 text-[10px] font-bold text-accent uppercase tracking-widest">Learn More</button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-accent/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
        </div>

        <div className="space-y-1">
          {userData?.role === 'admin' && (
            <button
              onClick={() => setShowAdmin(true)}
              className="w-full sidebar-item sidebar-item-inactive text-gold"
            >
              <Shield size={18} />
              {t.admin}
            </button>
          )}
          <button
            onClick={() => logout()}
            className="w-full sidebar-item sidebar-item-inactive text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
