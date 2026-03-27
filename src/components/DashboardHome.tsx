import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Heart, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardHomeProps {
  user: any;
  setView: (view: any) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user, setView }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('popular');
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const hotels = listings.filter(l => l.type === 'hotel');
  const resorts = listings.filter(l => l.type === 'experience').slice(0, 3);

  return (
    <div className="space-y-10 pb-10">
      {/* Hotels Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Hotels</h2>
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            {['popular', 'best-price', 'near-me'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.slice(0, 3).map((hotel) => (
            <motion.div 
              key={hotel.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm group cursor-pointer"
            >
              <div className="h-64 relative overflow-hidden">
                <img src={hotel.image || undefined} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <button className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                </button>
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-gray-900">
                  €{hotel.price}/night
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {hotel.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-bold text-gray-900">{hotel.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resorts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Resorts</h2>
          <button className="text-sm font-bold text-[#7C3AED] flex items-center gap-2 hover:gap-3 transition-all">
            View All <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resorts.map((resort) => (
            <div key={resort.id} className="flex gap-6 bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm group cursor-pointer">
              <div className="w-40 h-40 rounded-[2rem] overflow-hidden flex-shrink-0">
                <img src={resort.image || undefined} alt={resort.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex-1 py-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{resort.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {resort.location}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">€{resort.price}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-gray-900">{resort.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
