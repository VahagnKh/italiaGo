import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Calendar, Heart, CreditCard, Settings, LogOut, ExternalLink, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        const [bookingsRes, favoritesRes] = await Promise.all([
          fetch('/api/bookings/user', { headers }),
          fetch('/api/favorites', { headers })
        ]);

        const [bookingsData, favoritesData] = await Promise.all([
          bookingsRes.json(),
          favoritesRes.json()
        ]);

        setBookings(bookingsData);
        setFavorites(favoritesData);
      } catch (error) {
        console.error("Fetch dashboard data failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handlePayment = async (bookingId: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 mb-6">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 mx-auto overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-stone-400">{user?.displayName?.[0] || 'U'}</span>
                )}
              </div>
              <h2 className="text-center font-bold text-stone-900">{user?.displayName || 'User'}</h2>
              <p className="text-center text-xs text-stone-500 truncate">{user?.email}</p>
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-stone-900 text-white shadow-lg' 
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm min-h-[600px] p-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-8">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'bookings' && (
                    <div className="space-y-4">
                      {bookings.length > 0 ? (
                        bookings.map((booking: any) => (
                          <div key={booking.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                            <div className="w-24 h-24 bg-stone-200 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={`https://picsum.photos/seed/${booking.listing_id}/200/200`} alt={booking.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-stone-900">{booking.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                  booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.date).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {booking.guests} guests</span>
                                <span className="font-bold text-stone-900">€{booking.amount}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              {booking.status === 'pending' && (
                                <button 
                                  onClick={() => handlePayment(booking.id)}
                                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                                >
                                  Pay Now
                                </button>
                              )}
                              <button className="text-stone-500 hover:text-stone-900 text-xs font-bold underline">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20">
                          <Calendar className="mx-auto text-stone-200 mb-4" size={48} />
                          <p className="text-stone-500">You don't have any bookings yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'favorites' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {favorites.length > 0 ? (
                        favorites.map((fav: any) => (
                          <div key={fav.id} className="group bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                            <div className="aspect-video relative">
                              <img src={`https://picsum.photos/seed/${fav.listing_id}/600/400`} alt="Favorite" className="w-full h-full object-cover" />
                              <button className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 shadow-sm">
                                <Heart size={16} fill="currentColor" />
                              </button>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-stone-900 mb-2">Saved Listing</h3>
                              <button className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline">
                                View Listing <ExternalLink size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-20">
                          <Heart className="mx-auto text-stone-200 mb-4" size={48} />
                          <p className="text-stone-500">Your favorites list is empty.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div className="space-y-6">
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-stone-200 rounded flex items-center justify-center">
                            <CreditCard size={20} className="text-stone-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-stone-900">Visa ending in 4242</p>
                            <p className="text-xs text-stone-500">Expires 12/28</p>
                          </div>
                        </div>
                        <button className="text-stone-400 hover:text-red-500 transition-colors">
                          <XCircle size={20} />
                        </button>
                      </div>
                      <button className="w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 font-bold hover:border-stone-400 hover:text-stone-600 transition-all">
                        + Add New Payment Method
                      </button>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="max-w-md space-y-6">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">Display Name</label>
                        <input 
                          type="text" 
                          defaultValue={user?.displayName || ''}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">Email Address</label>
                        <input 
                          type="email" 
                          defaultValue={user?.email || ''}
                          disabled
                          className="w-full bg-stone-100 border border-stone-200 rounded-xl py-3 px-4 text-stone-500 cursor-not-allowed"
                        />
                      </div>
                      <button className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
