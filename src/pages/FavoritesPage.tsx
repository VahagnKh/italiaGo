import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../contexts/FavoriteContext';
import { motion } from 'framer-motion';

const FavoritesPage: React.FC = () => {
  const { favorites } = useFavorites();

  return (
    <div className="space-y-8 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Heart size={16} className="text-red-500 fill-red-500" />
          <span>{favorites.length} saved items</span>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No favorites yet</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Start exploring and save your favorite hotels, restaurants, and experiences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={favorite.image_url} 
                  alt={favorite.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-900">
                    {favorite.type}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="font-bold text-gray-900 group-hover:text-[#7C3AED] transition-colors">{favorite.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-1">{favorite.location}</p>
                <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                  <span className="text-sm font-bold text-[#7C3AED]">View Details</span>
                  <Heart size={18} className="text-red-500 fill-red-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
