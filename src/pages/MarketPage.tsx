import React from 'react';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MarketPage: React.FC = () => {
  const offers = [
    {
      id: 1,
      title: 'Luxury Spa Day',
      description: 'Full body massage & thermal circuit in Rome',
      points: 2500,
      image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6fe858?auto=format&fit=crop&q=80&w=800',
      category: 'Wellness'
    },
    {
      id: 2,
      title: 'Private Wine Tasting',
      description: 'Exclusive tour of a Tuscan vineyard',
      points: 5000,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800',
      category: 'Food & Drink'
    },
    {
      id: 3,
      title: 'Amalfi Coast Boat Tour',
      description: 'Full day private yacht experience',
      points: 12000,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
      category: 'Adventure'
    }
  ];

  return (
    <div className="space-y-8 py-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Points Market</h2>
          <p className="text-sm text-gray-500">Redeem your loyalty points for exclusive experiences</p>
        </div>
        <div className="bg-[#7C3AED]/10 px-4 py-2 rounded-full flex items-center gap-2 border border-[#7C3AED]/20">
          <Star size={16} className="text-[#7C3AED] fill-[#7C3AED]" />
          <span className="text-sm font-bold text-[#7C3AED]">2,450 Points Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={offer.image} 
                alt={offer.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-900">
                  {offer.category}
                </span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{offer.description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cost</span>
                  <span className="text-lg font-bold text-gray-900">{offer.points.toLocaleString()} pts</span>
                </div>
                <button className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-[#7C3AED] transition-all group/btn">
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketPage;
