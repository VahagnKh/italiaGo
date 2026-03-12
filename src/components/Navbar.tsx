import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { LogOut, User, Bell, MessageSquare, MapPin } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">I</div>
              <span className="text-xl font-bold tracking-tight text-stone-900">Italia<span className="text-emerald-600">Go</span></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors">Explore</Link>
            <Link to="/itinerary" className="text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors">AI Planner</Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Admin Panel</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
                  <MessageSquare size={20} />
                </button>
                <div className="h-8 w-px bg-stone-200 mx-2"></div>
                <Link to="/dashboard" className="flex items-center gap-2 p-1 pr-3 hover:bg-stone-100 rounded-full transition-colors">
                  <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-stone-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-stone-700 hidden sm:block">{user.displayName || 'Profile'}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">Login</Link>
                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
