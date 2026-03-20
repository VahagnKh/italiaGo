import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Hotel, Utensils, Sparkles, Compass, Car, Map as MapIcon 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import Suggestions from '../components/Suggestions';
import TranslatedText from '../components/TranslatedText';

const DESTINATIONS = [
  {
    id: 'rome',
    name: 'Rome',
    tagline: 'The Eternal City',
    image: 'https://picsum.photos/seed/rome/800/600',
    description: 'Where ancient history meets modern vibrant life.'
  },
  {
    id: 'milan',
    name: 'Milan',
    tagline: 'Fashion & Design',
    image: 'https://picsum.photos/seed/milan/800/600',
    description: 'The sophisticated heart of Italian commerce and style.'
  },
  {
    id: 'florence',
    name: 'Florence',
    tagline: 'Cradle of Renaissance',
    image: 'https://picsum.photos/seed/florence/800/600',
    description: 'An open-air museum of art and architectural wonders.'
  },
  {
    id: 'venice',
    name: 'Venice',
    tagline: 'The Floating City',
    image: 'https://picsum.photos/seed/venice/800/600',
    description: 'A magical city of canals, bridges, and timeless romance.'
  },
  {
    id: 'amalfi',
    name: 'Amalfi',
    tagline: 'Coastal Paradise',
    image: 'https://picsum.photos/seed/amalfi/800/600',
    description: 'Dramatic cliffs and turquoise waters of the Mediterranean.'
  },
  {
    id: 'lake-como',
    name: 'Lake Como',
    tagline: 'Alpine Elegance',
    image: 'https://picsum.photos/seed/como/800/600',
    description: 'Serene waters surrounded by majestic mountains and luxury villas.'
  }
];

const STORIES = [
  {
    id: 's1',
    title: 'A Sunset in Positano',
    author: 'Elena Rossi',
    image: 'https://picsum.photos/seed/positano-story/800/1000',
    excerpt: 'The sky turned a deep shade of orange as the sun dipped below the horizon, painting the colorful houses of Positano in a magical light...'
  },
  {
    id: 's2',
    title: 'The Secret Gardens of Rome',
    author: 'Marco Bianchi',
    image: 'https://picsum.photos/seed/rome-story/800/1000',
    excerpt: 'Hidden behind high stone walls and ancient gates, Rome\'s secret gardens offer a peaceful escape from the bustling city streets...'
  },
  {
    id: 's3',
    title: 'Truffle Hunting in Piedmont',
    author: 'Sofia Conti',
    image: 'https://picsum.photos/seed/truffle-story/800/1000',
    excerpt: 'Following the expert nose of a truffle dog through the misty woods of Piedmont is an experience like no other...'
  }
];

const HomePage: React.FC = () => {
  const { language: lang, t } = useLanguage();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://picsum.photos/seed/italy-hero/1920/1080" 
          alt="Italy" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white space-y-6 px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-6xl md:text-8xl font-display italic leading-tight"
          >
            {t.discover}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl font-light tracking-wide opacity-90"
          >
            {t.companion}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-8"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0px 0px 0px rgba(212, 175, 55, 0)", "0px 0px 20px rgba(212, 175, 55, 0.3)", "0px 0px 0px rgba(212, 175, 55, 0)"]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onClick={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} 
              className="group px-10 py-4 bg-ink text-paper rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl flex items-center gap-3 mx-auto"
            >
              {t.start}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {[
          { icon: Hotel, label: t.hotels, color: 'bg-blue-50 dark:bg-blue-900/20', path: '/hotels' },
          { icon: Utensils, label: t.restaurants, color: 'bg-orange-50 dark:bg-orange-900/20', path: '/restaurants' },
          { icon: Sparkles, label: t.experiences, color: 'bg-yellow-50 dark:bg-yellow-900/20', path: '/experiences' },
          { icon: Compass, label: t.tours, color: 'bg-emerald-50 dark:bg-emerald-900/20', path: '/tours' },
          { icon: Car, label: t.rentals, color: 'bg-red-50 dark:bg-red-900/20', path: '/rentals' },
          { icon: MapIcon, label: t.taxi, color: 'bg-purple-50 dark:bg-purple-900/20', path: '/taxi' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            onClick={() => navigate(item.path)}
            className="luxury-card p-8 flex flex-col items-center text-center space-y-4 cursor-pointer"
          >
            <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-ink`}>
              <item.icon size={32} />
            </div>
            <h3 className="font-bold text-lg uppercase tracking-widest text-ink">{item.label}</h3>
          </motion.div>
        ))}
      </section>

      {/* Suggestions */}
      <section className="max-w-7xl mx-auto px-6">
        <Suggestions t={t} />
      </section>

      {/* Destinations */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-display italic text-ink">{t.featured}</h2>
            <p className="text-ink/60 italic">Handpicked escapes for the discerning traveler.</p>
          </div>
          <button onClick={() => navigate('/discover')} className="btn-outline flex items-center gap-2">
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest) => (
            <motion.div 
              key={dest.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                navigate(`/discover?search=${dest.name}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative h-[500px] rounded-3xl overflow-hidden shadow-lg cursor-pointer"
            >
              <img src={dest.image || undefined} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-8 text-white space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{dest.tagline}</span>
                <h3 className="text-3xl font-display">{dest.name}</h3>
                <p className="text-sm opacity-80 font-light leading-relaxed">
                  <TranslatedText text={dest.description} lang={lang} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section className="bg-paper py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-display italic">{t.stories}</h2>
            <p className="text-ink/60 italic max-w-2xl mx-auto">Discover Italy through the eyes of fellow travelers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STORIES.map((story) => (
              <motion.div 
                key={story.id}
                className="space-y-6 group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-3xl">
                  <img src={story.image || undefined} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold">By {story.author}</p>
                  <h3 className="text-2xl font-display italic group-hover:text-gold transition-colors">{story.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed line-clamp-3">
                    <TranslatedText text={story.excerpt} lang={lang} />
                  </p>
                  <button 
                    onClick={() => addNotification("Full story coming soon to ItaliaGo Magazine.", 'info')}
                    className="text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all"
                  >
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-ink rounded-[3rem] p-12 md:p-24 text-center text-white space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="https://picsum.photos/seed/newsletter-bg/1920/1080" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display italic">Join the Inner Circle</h2>
            <p className="text-white/60 text-lg font-light">Receive exclusive offers, travel tips, and early access to new experiences.</p>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <input type="email" placeholder="Your email address" className="flex-1 bg-white/10 border border-white/20 rounded-full px-8 py-4 outline-none focus:ring-2 focus:ring-gold transition-all" />
              <button 
                onClick={() => addNotification('Welcome to the Inner Circle!', 'success')}
                className="btn-luxury px-12 py-4"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
