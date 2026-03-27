import React, { useState, useEffect } from 'react';
import { Settings, Camera, Plane, Hotel, Car, Ship, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RightPanel: React.FC = () => {
  const { user, userData, fetchWithAuth, token } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchWithAuth('/api/friends')
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  if (!user) return null;

  return (
    <div className="hidden xl:flex flex-col w-96 bg-white h-full p-8 overflow-y-auto space-y-10 border-l border-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
            <img src={userData?.avatar_url || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || user.displayName || 'User'}`} alt={userData?.name || user.displayName || 'User'} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#7C3AED] border-4 border-white rounded-xl flex items-center justify-center text-white">
            <Camera size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{userData?.name || user.displayName || 'User'}</h3>
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
          {friends.map((friend) => (
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
};

export default RightPanel;
