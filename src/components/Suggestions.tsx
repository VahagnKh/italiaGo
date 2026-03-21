import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SuggestionsProps {
  t: any;
}

const Suggestions: React.FC<SuggestionsProps> = ({ t }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    fetchWithAuth('/api/suggestions')
      .then(res => res.json())
      .then(data => setSuggestions(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching suggestions:", err));
  }, [fetchWithAuth]);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center">
          <Sparkles size={24} />
        </div>
        <div className="space-y-1">
          <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]">Personalized</span>
          <h3 className="text-2xl font-display italic text-ink">
            {t.suggestions || 'Recommended for You'}
          </h3>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {suggestions.map((item, index) => (
          <motion.div 
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="luxury-card group cursor-pointer"
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src={item.image || `https://picsum.photos/seed/${item.id}/800/600`} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 glass-light px-3 py-1 rounded-full text-[8px] font-bold text-ink uppercase tracking-widest">
                {item.type}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h4 className="font-display italic text-lg text-ink line-clamp-1 group-hover:text-gold transition-colors">{item.name}</h4>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-gold font-display text-xl">€{item.price}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-ink/40">
                  <Star size={12} fill="currentColor" className="text-gold" />
                  {item.rating}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
