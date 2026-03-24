import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ShoppingBag, 
  Trash2, 
  User, 
  Lock, 
  LayoutDashboard,
  X,
  Compass,
  Globe,
  Star,
  Tag,
  MapPin,
  Clock,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoriteContext';
import TranslatedText from '../components/TranslatedText';

const DashboardView: React.FC = () => {
  const { user, userData, fetchWithAuth, token } = useAuth();
  const { t, language: lang } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'market' | 'game' | 'profile'>('bookings');
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState(userData?.name || user?.displayName || '');
  const [profileAvatar, setProfileAvatar] = useState(userData?.avatar_url || user?.photoURL || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        const res = await fetchWithAuth('/api/friends');
        if (res.ok) {
          const data = await res.json();
          setFriends(data);
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
      } finally {
        setLoadingFriends(false);
      }
    };

    if (user) fetchFriends();
  }, [user]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

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
      const res = await fetchWithAuth('/api/user/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: profileName, avatar_url: profileAvatar }),
      });
      if (res.ok) {
        addNotification('Profile updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchWithAuth('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []));
    
    fetchWithAuth('/api/offers')
      .then(res => res.json())
      .then(data => setOffers(Array.isArray(data) ? data : []));
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-display italic text-ink">Please log in to view your dashboard.</h2>
      </div>
    );
  }

  const handleRedeem = async (offer: any) => {
    if (userData && userData.bonus < offer.discountPoints) {
      addNotification('Insufficient bonus points', 'error');
      return;
    }

    setIsRedeeming(offer.id);
    try {
      const res = await fetchWithAuth('/api/redeem', {
        method: 'POST',
        body: JSON.stringify({ offerId: offer.id, points: Number(offer.discountPoints) })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(`Successfully redeemed! Voucher: ITALIA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 'success');
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

  const handleCancelBooking = async (booking: any) => {
    setIsCancelling(true);
    try {
      const res = await fetchWithAuth(`/api/bookings/${booking.id}/cancel`, {
        method: 'POST'
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
        addNotification('Booking cancelled successfully', 'success');
      } else {
        const data = await res.json();
        addNotification(data.error || 'Cancellation failed', 'error');
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
      addNotification('Connection error during cancellation', 'error');
    } finally {
      setIsCancelling(false);
      setCancellingBooking(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl text-ink">{t.welcomeBack}, {userData?.name || user.displayName}</h1>
          <p className="text-sm sm:text-base text-ink/60">{t.manageBookings}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center min-w-[150px]">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">{t.wallet}</span>
            <span className="text-2xl font-display text-ink">€{userData?.wallet_balance?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center min-w-[150px]">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">{t.bonus}</span>
            <span className="text-2xl font-display text-gold">{userData?.bonus || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border overflow-x-auto no-scrollbar">
        {[
          { id: 'bookings', label: t.recentBookings },
          { id: 'favorites', label: `${t.yourFavorites} (${favorites.length})` },
          { id: 'market', label: t.bonusMarket },
          { id: 'game', label: 'Minigame' },
          { id: 'profile', label: t.profileSettings }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display italic text-ink">{t.recentBookings}</h2>
              <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-paper/50 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.item}</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.date}</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.amount}</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.status}</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-paper/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-paper overflow-hidden">
                                <img src={booking.image || 'https://picsum.photos/seed/booking/100/100'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <span className="font-bold text-ink">{booking.item_name || booking.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-ink/60">{new Date(booking.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold text-ink">€{booking.amount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              booking.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                              booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                              'bg-gold/10 text-gold'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {booking.status !== 'cancelled' && (
                              <button 
                                onClick={() => setCancellingBooking(booking)}
                                className="p-2 text-ink/20 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-ink/40 italic">No bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display italic text-ink">{t.yourFavorites}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favorites.map((item) => (
                  <div key={item.id} className="luxury-card group">
                    <div className="h-48 overflow-hidden relative">
                      <img src={item.image_url || 'https://picsum.photos/seed/fav/400/300'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => toggleFavorite(item)}
                        className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="p-6 space-y-2">
                      <h3 className="text-xl font-display text-ink">{item.name}</h3>
                      <p className="text-sm text-ink/60 flex items-center gap-1"><MapPin size={12} /> {item.location}</p>
                    </div>
                  </div>
                ))}
                {favorites.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-paper/30 rounded-3xl border border-dashed border-border">
                    <p className="text-ink/40 italic">You haven't added any favorites yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display italic text-ink">{t.profileSettings}</h2>
              <form onSubmit={handleUpdateProfile} className="bg-card rounded-3xl border border-border p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Choose Avatar</label>
                  <div className="grid grid-cols-5 gap-4">
                    {avatars.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setProfileAvatar(url)}
                        className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${profileAvatar === url ? 'border-gold scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      >
                        <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Display Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-paper border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isUpdatingProfile}
                  className="w-full btn-luxury py-4 flex items-center justify-center gap-3"
                >
                  {isUpdatingProfile ? <div className="w-5 h-5 border-2 border-paper border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-ink text-paper rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-display italic">Membership Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-display text-gold">{userData?.status || 'Normal'}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Level 1</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '35%' }}
                    className="h-full bg-gold"
                  />
                </div>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Next Level: 1500 Points</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[2.5rem] border border-border p-8 space-y-6">
            <h3 className="text-xl font-display italic text-ink">Recent Activity</h3>
            <div className="space-y-6">
              {notifications.map((n, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-red-500' : 'bg-gold'}`} />
                  <p className="text-sm text-ink/60 leading-relaxed">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-ink/40 italic">No recent activity.</p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-[2.5rem] border border-border p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-display italic text-ink">Friends</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{friends.length} Online</span>
            </div>
            <div className="space-y-4">
              {loadingFriends ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${friend.status === 'online' ? 'bg-emerald-500' : friend.status === 'away' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{friend.name}</p>
                      <p className="text-[10px] text-ink/40 uppercase tracking-widest">Level {friend.level}</p>
                    </div>
                  </div>
                  <button className="p-2 text-ink/20 hover:text-gold transition-colors">
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
              {friends.length === 0 && !loadingFriends && (
                <p className="text-sm text-ink/40 italic">No friends found.</p>
              )}
            </div>
            <button className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-ink/40 hover:text-gold transition-colors border-t border-border pt-6">
              Find More Friends
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {cancellingBooking && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingBooking(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-2xl font-display italic text-ink">Cancel Booking?</h3>
                <p className="text-ink/60">Are you sure you want to cancel your booking for <span className="font-bold text-ink">{cancellingBooking.title}</span>? This action cannot be undone.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setCancellingBooking(null)} className="flex-1 btn-outline py-4">Keep It</button>
                <button 
                  onClick={() => handleCancelBooking(cancellingBooking)}
                  disabled={isCancelling}
                  className="flex-1 bg-red-500 text-white rounded-full py-4 font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  {isCancelling ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;
