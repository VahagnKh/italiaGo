import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Hotel, Utensils, Car, Compass, Trash2, MapPin, Star, Sparkles, 
  Camera, Upload, User, Mail, Heart, Wallet, Gift, LayoutDashboard,
  MessageSquare, Settings, Gamepad2, ShoppingBag, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoriteContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useBookings } from '../contexts/BookingContext';

const DashboardPage: React.FC = () => {
  const { user, userData } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isBaseDashboard = location.pathname === '/dashboard';

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-display italic text-ink">Please log in to view your dashboard.</h2>
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', path: '/dashboard/inbox', icon: MessageSquare },
    { name: 'Favorites', path: '/dashboard/favorites', icon: Heart },
    { name: 'Market', path: '/dashboard/market', icon: ShoppingBag },
    { name: 'Minigame', path: '/dashboard/game', icon: Gamepad2 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="lg:w-64 space-y-8">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold/30">
                <img 
                  src={userData?.avatar_url || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt={userData?.name || user.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink truncate">{userData?.name || user.displayName || 'Guest'}</p>
                <p className="text-[10px] text-ink/40 uppercase tracking-widest truncate">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all group ${
                      isActive ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-paper hover:text-ink'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isActive ? 'bg-gold/20 text-gold' : 'bg-paper text-ink/40'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Stats Card */}
          <div className="bg-ink text-paper p-8 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-display italic">Rewards</h3>
                <span className="px-3 py-1 bg-gold/20 border border-gold text-gold rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {userData?.role === 'admin' ? 'Admin' : (userData?.status || 'Normal')}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-display text-gold">{userData?.bonus || 0}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-paper/40 mb-2">Points</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {isBaseDashboard ? (
            <DashboardOverview />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export const DashboardOverview: React.FC = () => {
  const { user, userData } = useAuth();
  const { t } = useLanguage();
  const { bookings, loading: bookingsLoading, cancelBooking } = useBookings();
  const { favorites } = useFavorites();
  const { addNotification } = useNotifications();

  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const displayName = userData?.name || user?.displayName || 'Guest';

  const handleCancelBooking = async (bookingId: string) => {
    setIsCancelling(true);
    try {
      await cancelBooking(bookingId);
      addNotification('Booking cancelled successfully', 'success');
    } catch (err) {
      console.error('Cancellation failed:', err);
      addNotification('Failed to cancel booking', 'error');
    } finally {
      setIsCancelling(false);
      setCancellingBooking(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-4xl font-display italic text-ink">{t.welcomeBack}, {displayName.split(' ')[0]}</h1>
        <p className="text-ink/60">{t.manageBookings}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Total Bookings</span>
          <p className="text-4xl font-display text-ink">{bookings.length}</p>
        </div>
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Bonus Points</span>
          <p className="text-4xl font-display text-gold">{userData?.bonus || 0}</p>
        </div>
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Favorites</span>
          <p className="text-4xl font-display text-ink">{favorites.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display italic text-ink">{t.recentBookings}</h2>
          <Link to="/dashboard/bookings" className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline">View All</Link>
        </div>
        
        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-paper/50 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookingsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full mx-auto"
                      />
                    </td>
                  </tr>
                ) : bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="hover:bg-paper/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-paper rounded-lg flex items-center justify-center text-ink">
                          {booking.type === 'hotel' && <Hotel size={14} />}
                          {booking.type === 'restaurant' && <Utensils size={14} />}
                          {booking.type === 'taxi' && <Car size={14} />}
                          {booking.type === 'tour' && <Compass size={14} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink">{booking.item_name}</p>
                          <p className="text-[10px] text-ink/40 uppercase tracking-widest">{booking.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink/60">
                      {booking.created_at?.toDate ? booking.created_at.toDate().toLocaleDateString() : (booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'Pending')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                        booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-paper text-ink/40'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-ink">
                      €{booking.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.type === 'taxi' && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button 
                          onClick={() => setCancellingBooking(booking)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                          title="Cancel Ride"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!bookingsLoading && bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-ink/40 italic">
                      No bookings found. Start exploring!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {cancellingBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCancelling && setCancellingBooking(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-[2.5rem] overflow-hidden shadow-2xl p-8 space-y-6 border border-border"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                  <X size={32} />
                </div>
                <h3 className="text-2xl font-display italic text-ink">Cancel Taxi Ride?</h3>
                <p className="text-sm text-ink/60">
                  Are you sure you want to cancel your ride for <span className="font-bold text-ink">{cancellingBooking.item_name}</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={isCancelling}
                  onClick={() => setCancellingBooking(null)}
                  className="flex-1 px-6 py-4 rounded-full border border-border text-xs font-bold uppercase tracking-widest hover:bg-paper transition-colors disabled:opacity-50"
                >
                  No, Keep it
                </button>
                <button 
                  disabled={isCancelling}
                  onClick={() => handleCancelBooking(cancellingBooking.id)}
                  className="flex-1 px-6 py-4 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCancelling ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
