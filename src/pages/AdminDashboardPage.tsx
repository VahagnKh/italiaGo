import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, List, Calendar, Users, Plus, Trash2, Edit, CheckCircle2, XCircle, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        const [statsRes, listingsRes, bookingsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/listings', { headers }),
          fetch('/api/admin/bookings', { headers }),
          fetch('/api/admin/users', { headers })
        ]);

        const [statsData, listingsData, bookingsData, usersData] = await Promise.all([
          statsRes.json(),
          listingsRes.json(),
          bookingsRes.json(),
          usersRes.json()
        ]);

        setStats(statsData);
        setListings(listingsData);
        setBookings(bookingsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Fetch admin data failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'Listings', icon: List },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="bg-emerald-600 p-6 rounded-3xl text-white mb-6 shadow-lg shadow-emerald-600/20">
              <h2 className="font-bold text-lg mb-1">Admin Panel</h2>
              <p className="text-emerald-100 text-xs">ItaliaGo Management</p>
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
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-stone-900">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                {activeTab === 'listings' && (
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors">
                    <Plus size={18} /> Add Listing
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && stats && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <DollarSign size={20} />
                          </div>
                          <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                          <h3 className="text-2xl font-bold text-stone-900">€{stats.totalRevenue || 0}</h3>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                            <ShoppingBag size={20} />
                          </div>
                          <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Bookings</p>
                          <h3 className="text-2xl font-bold text-stone-900">{stats.totalBookings || 0}</h3>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                            <Users size={20} />
                          </div>
                          <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                          <h3 className="text-2xl font-bold text-stone-900">{stats.totalUsers || 0}</h3>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp size={20} />
                          </div>
                          <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Rating</p>
                          <h3 className="text-2xl font-bold text-stone-900">4.8</h3>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                        <h3 className="font-bold text-stone-900 mb-6">Recent Bookings</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="text-stone-400 border-b border-stone-200">
                                <th className="pb-4 font-medium">User</th>
                                <th className="pb-4 font-medium">Listing</th>
                                <th className="pb-4 font-medium">Date</th>
                                <th className="pb-4 font-medium">Amount</th>
                                <th className="pb-4 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {bookings.slice(0, 5).map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-white/50 transition-colors">
                                  <td className="py-4 font-medium text-stone-900">{booking.user_name || 'User'}</td>
                                  <td className="py-4 text-stone-600">{booking.title}</td>
                                  <td className="py-4 text-stone-500">{new Date(booking.date).toLocaleDateString()}</td>
                                  <td className="py-4 font-bold text-stone-900">€{booking.amount}</td>
                                  <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'listings' && (
                    <div className="space-y-4">
                      {listings.map((listing: any) => (
                        <div key={listing.id} className="flex items-center gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="w-16 h-16 bg-stone-200 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-stone-900">{listing.title || listing.name}</h3>
                            <p className="text-xs text-stone-500">{listing.category} • {listing.location}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'bookings' && (
                    <div className="space-y-4">
                      {bookings.map((booking: any) => (
                        <div key={booking.id} className="flex items-center gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-stone-900">{booking.user_name}</h3>
                              <span className="text-stone-300">|</span>
                              <p className="text-xs text-stone-500">{booking.title}</p>
                            </div>
                            <p className="text-xs text-stone-400">{new Date(booking.date).toLocaleDateString()} • {booking.guests} guests • €{booking.amount}</p>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                                  <CheckCircle2 size={20} />
                                </button>
                                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <XCircle size={20} />
                                </button>
                              </>
                            )}
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div className="space-y-4">
                      {users.map((u: any) => (
                        <div key={u.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-bold text-stone-500">
                            {u.name?.[0] || 'U'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-stone-900">{u.name}</h3>
                            <p className="text-xs text-stone-500">{u.email} • {u.role}</p>
                          </div>
                          <button className="text-xs font-bold text-stone-400 hover:text-stone-900">Manage</button>
                        </div>
                      ))}
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

export default AdminDashboardPage;
