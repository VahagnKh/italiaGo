import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Image as ImageIcon,
  Star,
  MapPin,
  Euro,
  Tag,
  LayoutDashboard,
  Hotel,
  Utensils,
  Compass,
  Car,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Listing {
  id: string;
  type: string;
  name: string;
  location: string;
  price: number;
  price_level: string;
  image: string;
  stars: number;
  description: string;
  category: string;
  [key: string]: any;
}

export default function AdminView({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [editingListing, setEditingListing] = useState<Partial<Listing> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      setListings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingListing) return;
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingListing)
      });
      if (res.ok) {
        fetchListings();
        setEditingListing(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchListings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const types = [
    { id: 'hotel', icon: Hotel, label: 'Hotel' },
    { id: 'restaurant', icon: Utensils, label: 'Restaurant' },
    { id: 'tour', icon: Compass, label: 'Tour' },
    { id: 'experience', icon: Sparkles, label: 'Experience' },
    { id: 'rental', icon: Car, label: 'Rental' },
    { id: 'event', icon: Calendar, label: 'Event' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-paper z-[100] flex flex-col"
    >
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ink text-paper rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-display italic text-ink">{t.admin}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Listing Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setEditingListing({ type: 'hotel', stars: 5, price_level: 'medium', category: 'Standard' })}
            className="btn-luxury px-6 py-2.5 text-xs flex items-center gap-2"
          >
            <Plus size={16} /> {t.addListing}
          </button>
          <button onClick={onClose} className="p-2 hover:bg-paper rounded-full transition-colors text-ink">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <motion.div 
                  key={listing.id}
                  layout
                  className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm group"
                >
                  <div className="relative h-48">
                    <img src={listing.image || undefined} alt={listing.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingListing(listing)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-ink rounded-full hover:bg-gold hover:text-white transition-all shadow-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-ink/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {listing.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display italic text-xl text-ink">{listing.name}</h3>
                        <p className="text-xs text-ink/60 flex items-center gap-1">
                          <MapPin size={12} /> {listing.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display text-gold">€{listing.price}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{listing.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gold">
                      {Array.from({ length: listing.stars }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingListing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border flex justify-between items-center">
                <h2 className="text-2xl font-display italic text-ink">
                  {editingListing.id ? t.editListing : t.addListing}
                </h2>
                <button onClick={() => setEditingListing(null)} className="text-ink/40 hover:text-ink">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.type}</label>
                    <select 
                      value={editingListing.type}
                      onChange={(e) => setEditingListing({ ...editingListing, type: e.target.value })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                    >
                      {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.category}</label>
                    <select 
                      value={editingListing.category}
                      onChange={(e) => setEditingListing({ ...editingListing, category: e.target.value })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                    >
                      <option value="Budget">Budget</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.name}</label>
                  <input 
                    type="text"
                    value={editingListing.name || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, name: e.target.value })}
                    className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.location}</label>
                    <input 
                      type="text"
                      value={editingListing.location || ''}
                      onChange={(e) => setEditingListing({ ...editingListing, location: e.target.value })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.price}</label>
                    <input 
                      type="number"
                      value={editingListing.price || 0}
                      onChange={(e) => setEditingListing({ ...editingListing, price: parseFloat(e.target.value) })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.stars}</label>
                    <input 
                      type="number"
                      min="1"
                      max="5"
                      value={editingListing.stars || 5}
                      onChange={(e) => setEditingListing({ ...editingListing, stars: parseInt(e.target.value) })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.priceRange}</label>
                    <select 
                      value={editingListing.price_level}
                      onChange={(e) => setEditingListing({ ...editingListing, price_level: e.target.value })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.image}</label>
                  <input 
                    type="text"
                    value={editingListing.image || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, image: e.target.value })}
                    className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.description}</label>
                  <textarea 
                    value={editingListing.description || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })}
                    className="w-full bg-paper/50 border-none rounded-2xl px-6 py-8 outline-none focus:ring-1 focus:ring-gold text-ink min-h-[120px]"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-border bg-paper/30 flex gap-4">
                <button 
                  onClick={() => setEditingListing(null)}
                  className="flex-1 btn-outline py-4"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 btn-luxury py-4 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {t.save}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
