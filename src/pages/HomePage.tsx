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
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full"
          >
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=1920"
            >
              <source 
                src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27ee348587d5906d54958d0e881715a221fd861&profile_id=164&oauth2_token_id=57447761" 
                type="video/mp4" 
              />
            </video>
          </motion.div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-bg" />
        </div>
        
        <div className="relative z-10 text-center text-white space-y-8 px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-4"
          >
            <motion.span 
              initial={{ letterSpacing: "0.2em", opacity: 0 }}
              animate={{ letterSpacing: "0.4em", opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="text-gold font-bold uppercase text-xs sm:text-sm block"
            >
              <TranslatedText text="Benvenuti in Italia" lang={lang} />
            </motion.span>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-display italic leading-tight text-glow">
              {t.discover}
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="text-lg sm:text-xl md:text-2xl font-light tracking-wide opacity-80 max-w-2xl mx-auto leading-relaxed"
          >
            {t.companion}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} 
              className="btn-luxury group flex items-center gap-4"
            >
              {t.start}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/discover')}
              className="px-10 py-5 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest shadow-2xl"
            >
              <TranslatedText text="Explore Destinations" lang={lang} />
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" 
          />
        </motion.div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]"><TranslatedText text="What We Offer" lang={lang} /></span>
          <h2 className="text-4xl md:text-6xl font-display italic"><TranslatedText text="Luxury Services" lang={lang} /></h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { icon: Hotel, label: t.hotels, color: 'bg-blue-50/50 dark:bg-blue-900/10', path: '/hotels' },
            { icon: Utensils, label: t.restaurants, color: 'bg-orange-50/50 dark:bg-orange-900/10', path: '/restaurants' },
            { icon: Sparkles, label: t.experiences, color: 'bg-yellow-50/50 dark:bg-yellow-900/10', path: '/experiences' },
            { icon: Compass, label: t.tours, color: 'bg-emerald-50/50 dark:bg-emerald-900/10', path: '/tours' },
            { icon: Car, label: t.rentals, color: 'bg-red-50/50 dark:bg-red-900/10', path: '/rentals' },
            { icon: MapIcon, label: t.taxi, color: 'bg-purple-50/50 dark:bg-purple-900/10', path: '/taxi' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => navigate(item.path)}
              className="luxury-card p-8 flex flex-col items-center text-center space-y-4 cursor-pointer group"
            >
              <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-ink group-hover:bg-gold group-hover:text-white transition-all duration-500`}>
                <item.icon size={32} />
              </div>
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-ink group-hover:text-gold transition-colors">{item.label}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Suggestions */}
      <section className="max-w-7xl mx-auto px-6">
        <Suggestions t={t} />
      </section>

      {/* Destinations */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="space-y-4">
            <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]"><TranslatedText text="Curated Selection" lang={lang} /></span>
            <h2 className="text-4xl md:text-6xl font-display italic text-ink">{t.featured}</h2>
            <p className="text-ink/60 italic"><TranslatedText text="Handpicked escapes for the discerning traveler." lang={lang} /></p>
          </div>
          <button onClick={() => navigate('/discover')} className="btn-outline flex items-center gap-2 group">
            <TranslatedText text="View All" lang={lang} /> <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest, index) => (
            <motion.div 
              key={dest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => {
                navigate(`/discover?search=${dest.name}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative h-[500px] rounded-3xl overflow-hidden shadow-lg cursor-pointer"
            >
              <img 
                src={dest.image || undefined} 
                alt={dest.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute bottom-0 p-8 text-white space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{dest.tagline}</span>
                <h3 className="text-4xl font-display italic">{dest.name}</h3>
                <p className="text-sm opacity-0 group-hover:opacity-80 font-light leading-relaxed transition-opacity duration-500 line-clamp-2">
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
            <p className="text-ink/60 italic max-w-2xl mx-auto"><TranslatedText text="Discover Italy through the eyes of fellow travelers." lang={lang} /></p>
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
                    <TranslatedText text="Read More" lang={lang} /> <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-ink rounded-[3rem] p-12 md:p-24 text-center text-white space-y-8 relative overflow-hidden group"
        >
          <motion.div 
            initial={{ scale: 1.2 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 opacity-30"
          >
            <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/40 to-ink/80" />
          
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]"><TranslatedText text="Exclusive Access" lang={lang} /></span>
              <h2 className="text-5xl md:text-7xl font-display italic"><TranslatedText text="Join the Inner Circle" lang={lang} /></h2>
              <p className="text-white/60 text-lg font-light leading-relaxed"><TranslatedText text="Receive curated travel inspiration, exclusive offers, and early access to our most prestigious experiences." lang={lang} /></p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-5 outline-none focus:ring-2 focus:ring-gold transition-all backdrop-blur-md" 
              />
              <button 
                onClick={() => addNotification('Welcome to the Inner Circle!', 'success')}
                className="btn-luxury px-12 py-5"
              >
                Subscribe
              </button>
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest"><TranslatedText text="By subscribing, you agree to our privacy policy." lang={lang} /></p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
