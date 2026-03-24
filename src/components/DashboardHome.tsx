import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Users, DollarSign, Calendar as CalendarIcon, 
  MapPin, Star, ChevronRight, ArrowUpRight, Clock,
  Plane, Hotel, Car, Ship
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const DashboardHome: React.FC = () => {
  const { t } = useLanguage();
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(console.error);
  }, []);

  const stats = [
    { label: 'Total Bookings', value: '1,284', change: '+12.5%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Active Users', value: '8,432', change: '+18.2%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Revenue', value: '$42,850', change: '+24.1%', icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display italic text-gray-900">Welcome back, Explorer</h1>
          <p className="text-sm text-gray-400">Here's what's happening with your travel plans today.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline py-3 px-6">Download Report</button>
          <button className="btn-luxury py-3 px-6">New Booking</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-10">
          {/* Featured Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[400px] rounded-[3rem] overflow-hidden group shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=2000" 
              alt="Venice" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-12 space-y-4 w-full">
              <div className="flex items-center gap-2 text-gold">
                <Star size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-widest">Featured Destination</span>
              </div>
              <h2 className="text-5xl font-display italic text-white">Venice: The Floating City</h2>
              <p className="text-white/70 max-w-xl text-sm leading-relaxed">
                Experience the magic of the canals, historic architecture, and hidden gems of Venice this spring.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all">
                  Explore Now
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
                  Save to Wishlist
                </button>
              </div>
            </div>
          </motion.div>

          {/* Trending Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display italic text-gray-900">Trending Destinations</h2>
              <button className="text-accent text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:underline">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              {listings.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 w-72 luxury-card group"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-gray-900">
                      ${item.price_per_night || item.price}/night
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 truncate pr-2">{item.name}</h3>
                      <div className="flex items-center gap-1 text-gold">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{item.stars || 4.8}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <MapPin size={12} />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-10">
          {/* Quick Actions */}
          <div className="dashboard-card space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Quick Services</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Plane, label: 'Flights', color: 'bg-blue-50 text-blue-500' },
                { icon: Hotel, label: 'Hotels', color: 'bg-orange-50 text-orange-500' },
                { icon: Car, label: 'Cars', color: 'bg-purple-50 text-purple-500' },
                { icon: Ship, label: 'Cruises', color: 'bg-emerald-50 text-emerald-500' },
              ].map((item, i) => (
                <button key={i} className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-gray-50 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="dashboard-card space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Upcoming Trips</h3>
              <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
                <CalendarIcon size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Rome Getaway', date: 'Mar 28 - Apr 2', status: 'Confirmed', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400' },
                { title: 'Amalfi Coast', date: 'May 12 - May 18', status: 'Pending', img: 'https://images.unsplash.com/photo-1633321088355-d0f81134ca3b?auto=format&fit=crop&q=80&w=400' },
              ].map((trip, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={trip.img} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{trip.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      <Clock size={10} />
                      <span>{trip.date}</span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${trip.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                </div>
              ))}
            </div>
            <button className="w-full py-4 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-accent hover:text-accent transition-all">
              + Add New Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
