import React, { useState, useEffect } from 'react';
import { Settings, Camera, Plane, Hotel, Car, Ship, CreditCard, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';

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
    <div className="hidden xl:flex flex-col w-[400px] bg-white h-full p-10 overflow-y-auto space-y-12 border-l border-gray-100 no-scrollbar">
      {/* Profile Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display italic text-gray-900">My Profile</h2>
        <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all hover:rotate-90 duration-500">
          <Settings size={20} />
        </button>
      </div>

      {/* Profile Card */}
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl"
          >
            <img 
              src={userData?.avatar_url || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || user.displayName || 'User'}`} 
              alt={userData?.name || user.displayName || 'User'} 
              className="w-full h-full object-cover" 
            />
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-lg"
          >
            <Camera size={16} />
          </motion.button>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{userData?.name || user.displayName || 'User'}</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{userData?.role || 'Traveler'} & Explorer</p>
        </div>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-6 rounded-3xl text-center space-y-1">
          <p className="text-xl font-bold text-gray-900">24</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trips</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-3xl text-center space-y-1">
          <p className="text-xl font-bold text-gray-900">12</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reviews</p>
        </div>
      </div>

      {/* Friends Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Travel Friends</h2>
          <button className="p-2 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex -space-x-4 overflow-hidden">
          {friends.length > 0 ? friends.map((friend, i) => (
            <motion.div 
              key={friend.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="inline-block h-12 w-12 rounded-2xl ring-4 ring-white overflow-hidden bg-gray-100 shadow-lg"
            >
              <img src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full object-cover" />
            </motion.div>
          )) : (
            [1,2,3,4].map((_, i) => (
              <div key={i} className="inline-block h-12 w-12 rounded-2xl ring-4 ring-white overflow-hidden bg-gray-100 shadow-lg">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Friend${i}`} alt="Friend" className="w-full h-full object-cover" />
              </div>
            ))
          )}
          <button className="flex items-center justify-center h-12 w-12 rounded-2xl ring-4 ring-white bg-gray-900 text-white text-xs font-bold hover:bg-accent transition-all shadow-lg">
            +8
          </button>
        </div>
      </div>

      {/* Payment Card Widget */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-10 relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Total Balance</p>
            <p className="text-3xl font-bold">$12,850.00</p>
          </div>
          <div className="w-14 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/10">
            <CreditCard size={24} />
          </div>
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-lg font-medium tracking-[0.3em]">**** 4580</p>
            <div className="flex gap-4">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Exp: 12/26</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">CVV: ***</p>
            </div>
          </div>
          <div className="flex -space-x-3">
            <div className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm" />
            <div className="w-8 h-8 rounded-full bg-yellow-500/80 backdrop-blur-sm" />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </motion.div>
    </div>
  );
};

export default RightPanel;
