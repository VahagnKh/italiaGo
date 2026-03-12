import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ListingCardProps {
  listing: {
    id: string;
    title?: string;
    name?: string;
    location: string;
    price: number;
    image: string;
    rating?: number;
    stars?: number;
    category: string;
  };
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const title = listing.title || listing.name;
  const rating = listing.rating || listing.stars || 0;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all group"
    >
      <Link to={`/listing/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img 
          src={listing.image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:text-red-500 transition-colors shadow-sm">
            <Heart size={18} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-sm">
            {listing.category}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-stone-900 line-clamp-1 flex-1">{title}</h3>
          <div className="flex items-center gap-1 text-amber-500 ml-2">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-stone-500 text-xs mb-3">
          <MapPin size={12} />
          <span>{listing.location}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-stone-900">€{listing.price}</span>
            <span className="text-stone-500 text-xs ml-1">/ person</span>
          </div>
          <Link 
            to={`/listing/${listing.id}`}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
          >
            See More Info
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
