import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Star, Heart, MapPin, Search, Tag, X, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoriteContext';
import { useBasket } from '../contexts/BasketContext';
import TranslatedText from '../components/TranslatedText';
import Suggestions from '../components/Suggestions';

interface ListViewProps {
  items: any[];
  type: string;
  title: string;
  t?: any;
  lang?: any;
  onAddToBasket?: (item: any) => void;
  favorites?: any[];
  onToggleFavorite?: (item: any) => void;
  user?: any;
  initialFilter?: string;
  initialPriceFilter?: string;
  initialSearch?: string;
}

const ListView: React.FC<ListViewProps> = ({ 
  items, 
  type, 
  title
}) => {
  const { language: lang, t } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToBasket } = useBasket();
  const [searchParams] = useSearchParams();
  
  const initialSearch = searchParams.get('search') || '';

  const [filter, setFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState(initialSearch);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const locations = Array.from(new Set(['all', ...items.map(item => item.location), filter].filter(Boolean)));
  const priceLevels = ['all', 'low', 'medium', 'high'];
  const starLevels = ['all', 3, 4, 5];

  const filteredItems = items.filter(item => {
    const locMatch = filter === 'all' || (item.location || '') === filter;
    const priceMatch = priceFilter === 'all' || (item.price_level || '') === priceFilter;
    const starMatch = starFilter === 'all' || (item.stars || 0) >= (starFilter as number);
    const searchMatch = !search || 
      (item.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    return locMatch && priceMatch && starMatch && searchMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display italic text-ink">{title}</h1>
            <p className="text-xs sm:text-sm text-ink/60 italic">Curated selections for an authentic Italian experience.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl sm:rounded-full border border-border shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40 px-3 whitespace-nowrap">{t.filter}</span>
              <div className="flex gap-1">
                {locations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => setFilter(loc)}
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                      filter === loc 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-paper text-ink/60'
                    }`}
                  >
                    {loc === 'all' ? t.all : loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl sm:rounded-full border border-border shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40 px-3 whitespace-nowrap">{t.priceRange}</span>
              <div className="flex gap-1">
                {priceLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setPriceFilter(level)}
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                      priceFilter === level 
                        ? 'bg-gold text-white' 
                        : 'hover:bg-paper text-ink/60'
                    }`}
                  >
                    {level === 'all' ? t.all : t[level]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl sm:rounded-full border border-border shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40 px-3 whitespace-nowrap">{t.rating}</span>
              <div className="flex gap-1">
                {starLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setStarFilter(level as any)}
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                      starFilter === level 
                        ? 'bg-gold text-white' 
                        : 'hover:bg-paper text-ink/60'
                    }`}
                  >
                    {level === 'all' ? t.all : (
                      <>
                        {level} <Star size={10} fill="currentColor" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <motion.div 
              key={`${item.type}-${item.id}`}
              whileHover={{ y: -10 }}
              className="luxury-card group cursor-pointer"
            >
              <div className="h-64 overflow-hidden relative">
                <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4">
                  <div className="bg-card/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                    {Array.from({ length: item.stars }).map((_, j) => (
                      <Star key={j} size={10} fill="currentColor" className="text-gold" />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                    favorites.some(f => f.id === item.id && f.type === item.type) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-card/90 backdrop-blur text-ink/40 hover:text-red-500'
                  }`}
                >
                  <Heart size={14} fill={favorites.some(f => f.id === item.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="p-6 space-y-4 bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-display text-ink">{item.name}</h3>
                    <p className="text-sm text-ink/60 flex items-center gap-1">
                      <MapPin size={12} /> {item.location}
                    </p>
                  </div>
                  {item.price && <span className="font-bold text-ink">€{item.price}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedItem(item)} className="flex-1 btn-outline text-xs py-2">{t.more}</button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToBasket(item); }}
                    className="flex-1 btn-luxury text-xs py-2"
                  >
                    {t.addToBasket}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-paper rounded-full flex items-center justify-center mx-auto text-ink/20">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-display italic text-ink">No results found</h3>
              <p className="text-ink/60 max-w-md mx-auto">We couldn't find any {type === 'all' ? 'items' : type + 's'} matching your current filters. Try adjusting your search or explore our recommendations below.</p>
              <button 
                onClick={() => { setFilter('all'); setPriceFilter('all'); setStarFilter('all'); setSearch(''); }}
                className="text-gold font-bold uppercase tracking-widest text-xs hover:underline"
              >
                Clear all filters
              </button>
            </div>

            <div className="pt-12 border-t border-border">
              <Suggestions t={t} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-20">
        <Suggestions t={t} />
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-card/80 backdrop-blur rounded-full flex items-center justify-center text-ink hover:bg-card transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="overflow-y-auto flex-1">
                <div className="h-64 overflow-hidden">
                  <img src={selectedItem.image || undefined} alt={selectedItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="p-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display text-ink">{selectedItem.name}</h2>
                    <p className="text-ink/60 flex items-center gap-1">
                      <MapPin size={14} /> {selectedItem.location}
                    </p>
                  </div>
                  {selectedItem.price && <span className="text-2xl font-display text-ink">€{selectedItem.price}</span>}
                </div>
                
                <div className="space-y-4">
                  <p className="text-ink/80 leading-relaxed">
                    <TranslatedText text={selectedItem.description} lang={lang} />
                  </p>
                  
                  {selectedItem.amenities && (
                    <div className="flex flex-wrap gap-2">
                      {(typeof selectedItem.amenities === 'string' ? selectedItem.amenities.split(',') : selectedItem.amenities).map((a: string) => (
                        <span key={a} className="px-3 py-1 bg-paper rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <TranslatedText text={a.trim()} lang={lang} />
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    {selectedItem.address && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Address</h4>
                        <p className="text-xs text-ink/80">{selectedItem.address}</p>
                        {selectedItem.map_url && (
                          <a href={selectedItem.map_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gold font-bold hover:underline flex items-center gap-1">
                            <MapPin size={10} /> View on Map
                          </a>
                        )}
                      </div>
                    )}
                    {selectedItem.availability && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Availability</h4>
                        <p className="text-xs text-ink/80">{selectedItem.availability}</p>
                      </div>
                    )}
                    {selectedItem.duration && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Duration</h4>
                        <p className="text-xs text-ink/80">{selectedItem.duration}</p>
                      </div>
                    )}
                    {selectedItem.hours && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Hours</h4>
                        <p className="text-xs text-ink/80">{selectedItem.hours}</p>
                      </div>
                    )}
                    {selectedItem.cuisine_type && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Cuisine</h4>
                        <p className="text-xs text-ink/80">{selectedItem.cuisine_type}</p>
                      </div>
                    )}
                  </div>

                  {selectedItem.promotions && (
                    <div className="p-4 bg-gold/10 border border-gold/20 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white">
                        <Tag size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Promotion</h4>
                        <p className="text-sm text-ink/80 font-medium">{selectedItem.promotions}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => { addToBasket(selectedItem); setSelectedItem(null); }}
                  className="w-full btn-luxury py-4 flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} />
                  {t.addToBasket} - €{selectedItem.price}
                </button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListView;
