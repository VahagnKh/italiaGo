import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SuggestionsProps {
  t: any;
}

const Suggestions: React.FC<SuggestionsProps> = ({ t }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/suggestions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSuggestions(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching suggestions:", err));
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display italic text-ink flex items-center gap-2">
        <Sparkles size={20} className="text-gold" />
        {t.suggestions || 'Recommended for You'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map(item => (
          <motion.div 
            key={`${item.type}-${item.id}`}
            whileHover={{ y: -5 }}
            className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm group cursor-pointer"
          >
            <div className="h-32 relative overflow-hidden">
              <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-gold">
                {(item.type || 'item').toUpperCase()}
              </div>
            </div>
            <div className="p-3 space-y-1">
              <h4 className="font-bold text-xs text-ink line-clamp-1">{item.name}</h4>
              <div className="flex justify-between items-center">
                <span className="text-gold font-display text-sm">€{item.price}</span>
                <div className="flex items-center gap-1 text-[10px] text-ink/40">
                  <Star size={8} fill="currentColor" className="text-gold" />
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
