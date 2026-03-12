import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';
import { Search, SlidersHorizontal, MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const categories = [
  { id: 'All', label: 'All' },
  { id: 'Hotels', label: 'Hotels' },
  { id: 'Restaurants', label: 'Restaurants' },
  { id: 'Experiences', label: 'Experiences' },
  { id: 'Tours', label: 'Tours' },
  { id: 'Rentals', label: 'Rentals' },
  { id: 'Events', label: 'Events' },
  { id: 'Taxi', label: 'Taxi' },
];

const HomePage: React.FC = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(1000);
  const [minRating, setMinRating] = useState(0);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (searchQuery) params.append('q', searchQuery);
      params.append('maxPrice', priceRange.toString());
      if (minRating > 0) params.append('minRating', minRating.toString());

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setListings(data);
    } catch (error) {
      console.error("Fetch listings failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeCategory, priceRange, minRating]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=2000" 
              alt="Venice" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 max-w-4xl w-full px-4 text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              Discover the Soul of Italy
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-stone-100 mb-10 max-w-2xl mx-auto font-light"
            >
              From the canals of Venice to the hills of Tuscany, find your perfect Italian escape.
            </motion.p>

            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch}
              className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto"
            >
              <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-stone-100 py-2">
                <Search className="text-stone-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Where are you going?" 
                  className="w-full bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-stone-100 py-2">
                <Calendar className="text-stone-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Add dates" 
                  className="w-full bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 text-sm"
                  readOnly
                />
              </div>
              <div className="flex-1 flex items-center px-4 gap-3 py-2">
                <Users className="text-stone-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Add guests" 
                  className="w-full bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 text-sm"
                  readOnly
                />
              </div>
              <button 
                type="submit"
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Search
              </button>
            </motion.form>
          </div>
        </section>

        {/* Filters & Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-stone-900 text-white shadow-lg' 
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-48">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Max Price: €{priceRange}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="w-px h-8 bg-stone-200"></div>
              <div className="flex gap-1">
                {[3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      minRating === rating 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {rating}★+
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Listing Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-stone-200 aspect-[4/3] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-stone-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900">No results found</h3>
              <p className="text-stone-500">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  setPriceRange(2000);
                  setMinRating(0);
                }}
                className="mt-6 text-emerald-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* AI Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-stone-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group">
          <Sparkles size={24} className="group-hover:animate-pulse" />
          <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl shadow-xl border border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            <span className="text-sm font-bold text-stone-900">Ask AI Assistant</span>
          </div>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
