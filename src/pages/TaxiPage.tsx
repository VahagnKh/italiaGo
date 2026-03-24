import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Compass, Star, Sparkles, VolumeX, Briefcase, Baby, Dog, Car, User, Phone, MessageSquare, CheckCircle2, Clock, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';
import { useLanguage } from '../contexts/LanguageContext';

const TaxiPage: React.FC = () => {
  const { user, userData } = useAuth();
  const { createBooking } = useBookings();
  const { t, language: lang } = useLanguage();
  
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [pickup, setPickup] = useState('Piazza del Popolo, Roma');
  const [destination, setDestination] = useState('');
  const [selectedCar, setSelectedCar] = useState<number>(0);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [isRequesting, setIsRequesting] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [rideOptions, setRideOptions] = useState<string[]>([]);
  const [rideStatus, setRideStatus] = useState<'idle' | 'searching' | 'enroute' | 'arrived'>('idle');
  const [estimate, setEstimate] = useState<{ cost: number, time: number, traffic: string, distance: string } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, (err) => {
      console.error("Geolocation error:", err);
      // Fallback to Rome
      setCoords({ lat: 41.9028, lng: 12.4964 });
    });
  }, []);

  const VEHICLES = [
    { 
      id: 0, 
      company: 'Roma Elite Transports', 
      name: 'Mercedes S-Class', 
      type: 'Luxury Sedan', 
      basePrice: 45, 
      multiplier: 1.5, 
      stars: 5, 
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Alessandro', rating: 4.9, photo: 'https://i.pravatar.cc/150?u=alessandro', trips: 1240, carPlate: 'RM 452 EL' }
    },
    { 
      id: 1, 
      company: 'Prestige Italia', 
      name: 'Range Rover Vogue', 
      type: 'Luxury SUV', 
      basePrice: 60, 
      multiplier: 1.8, 
      stars: 5, 
      image: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Marco', rating: 4.8, photo: 'https://i.pravatar.cc/150?u=marco', trips: 850, carPlate: 'PR 782 IT' }
    },
    { 
      id: 2, 
      company: 'Veloce Luxury', 
      name: 'Maserati Quattroporte', 
      type: 'Sport Luxury', 
      basePrice: 80, 
      multiplier: 2.2, 
      stars: 4, 
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Giulia', rating: 4.9, photo: 'https://i.pravatar.cc/150?u=giulia', trips: 520, carPlate: 'VL 991 SP' }
    },
    { 
      id: 3, 
      company: 'City Cab Roma', 
      name: 'Toyota Prius', 
      type: 'Economy Hybrid', 
      basePrice: 15, 
      multiplier: 0.8, 
      stars: 3, 
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Luca', rating: 4.6, photo: 'https://i.pravatar.cc/150?u=luca', trips: 3400, carPlate: 'CC 112 RM' }
    },
    { 
      id: 4, 
      company: 'EcoTravel Italy', 
      name: 'Tesla Model S', 
      type: 'Premium Electric', 
      basePrice: 50, 
      multiplier: 1.6, 
      stars: 5, 
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Sofia', rating: 5.0, photo: 'https://i.pravatar.cc/150?u=sofia', trips: 210, carPlate: 'ET 001 TS' }
    },
    { 
      id: 5, 
      company: 'Standard Transports', 
      name: 'Volkswagen Passat', 
      type: 'Standard Sedan', 
      basePrice: 25, 
      multiplier: 1.0, 
      stars: 3, 
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=200',
      driver: { name: 'Pietro', rating: 4.7, photo: 'https://i.pravatar.cc/150?u=pietro', trips: 1560, carPlate: 'ST 552 TR' }
    },
  ];

  const filteredVehicles = VEHICLES.filter(v => starFilter === 'all' || v.stars === starFilter);

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    if (val.length > 3) {
      const dist = (val.length * 0.4).toFixed(1);
      const trafficLevels = ['Low', 'Moderate', 'Heavy'];
      const traffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
      const trafficMult = traffic === 'Heavy' ? 1.6 : (traffic === 'Moderate' ? 1.2 : 1);
      const car = VEHICLES[selectedCar];
      
      setEstimate({
        distance: `${dist} km`,
        cost: (car.basePrice + parseFloat(dist) * car.multiplier) * trafficMult,
        time: Math.round(parseFloat(dist) * 3 * trafficMult),
        traffic
      });
    } else {
      setEstimate(null);
    }
  };

  const handleRequest = async () => {
    if (!destination || !estimate) return;
    setIsRequesting(true);
    
    const minigameDiscount = userData?.last_game_win ? estimate.cost * 0.1 : 0;
    const pointsToUse = usePoints ? Math.min(userData?.bonus || 0, Math.floor((estimate.cost - minigameDiscount) * 10)) : 0;
    
    try {
      await createBooking({
        type: 'taxi',
        listing_id: 'taxi-booking',
        listing_type: 'taxi',
        item_name: `Ride to ${destination}`,
        details: `From ${pickup} to ${destination}. Options: ${rideOptions.join(', ')}`,
        amount: estimate.cost,
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0],
      });
      
      setRideStatus('searching');
      setTimeout(() => setRideStatus('enroute'), 2500);
      setTimeout(() => {
        setRideStatus('arrived');
      }, 8000);
    } catch (err) {
      console.error("Booking error:", err);
      setIsRequesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-display italic text-ink">
            {t.privateTransport}
          </h1>
          <p className="text-ink/60 italic">
            {t.luxuryFingertips}
          </p>
        </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-card p-2 rounded-full border border-border shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 px-4 whitespace-nowrap">{t.rating}</span>
                <div className="flex gap-1">
                  {['all', 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setStarFilter(level as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
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
              
              {userData && (userData.bonus || 0) > 0 && (
                <button 
                  onClick={() => setUsePoints(!usePoints)}
                  className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${
                    usePoints ? 'bg-gold text-white border-gold' : 'bg-card text-ink/60 border-border hover:border-gold'
                  }`}
                >
                  <Sparkles size={14} />
                  Use Points (-€{(Math.min(userData.bonus || 0, Math.floor((estimate?.cost || 0) * 10)) / 10).toFixed(2)})
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleRequest}
                disabled={!destination || isRequesting}
                className={`flex-1 md:flex-none btn-luxury px-10 ${(!destination || isRequesting) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRequesting ? t.requesting : t.requestNow}
              </button>
              <button className="flex-1 md:flex-none btn-outline px-10">{t.schedule}</button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.pickup}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">{t.destination}</label>
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                  <input 
                    type="text" 
                    placeholder={t.whereTo}
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all"
                  />
                </div>
              </div>
            </div>

            {estimate && (
              <div className="space-y-4 pt-4 border-t border-border">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.estCost}</span>
                    <div className="flex flex-col">
                      <span className={`text-xl font-display ${userData?.last_game_win ? 'text-ink/40 line-through text-sm' : 'text-gold'}`}>€{estimate.cost.toFixed(2)}</span>
                      {userData?.last_game_win && (
                        <span className="text-xl font-display text-gold">€{(estimate.cost * 0.9).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.estTime}</span>
                    <span className="text-xl font-display text-ink">{estimate.time} mins</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.distance}</span>
                    <span className="text-xl font-display text-ink">{estimate.distance}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.traffic}</span>
                    <span className={`text-xl font-display ${estimate.traffic === 'Heavy' ? 'text-red-500' : estimate.traffic === 'Moderate' ? 'text-orange-500' : 'text-emerald-500'}`}>
                      {estimate.traffic}
                    </span>
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Ride Options</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'quiet', label: 'Quiet Ride', icon: <VolumeX size={12} /> },
                      { id: 'luggage', label: 'Extra Luggage', icon: <Briefcase size={12} /> },
                      { id: 'child', label: 'Child Seat', icon: <Baby size={12} /> },
                      { id: 'pet', label: 'Pet Friendly', icon: <Dog size={12} /> }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setRideOptions(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                          rideOptions.includes(opt.id) ? 'bg-gold text-white' : 'bg-paper text-ink/40 hover:bg-paper/80'
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-[500px] rounded-[2.5rem] overflow-hidden shadow-lg border border-border relative group">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${coords?.lng || 12.4964}!3d${coords?.lat || 41.9028}!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!5e0!3m2!1sen!2sit!4v1620000000000!5m2!1sen!2sit`}
            ></iframe>
            
            <AnimatePresence>
              {rideStatus !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center text-gold">
                          {rideStatus === 'searching' ? <Search className="animate-pulse" /> : <Car />}
                        </div>
                        <div>
                          <h3 className="font-display text-xl text-ink">
                            {rideStatus === 'searching' ? 'Finding Driver...' : 
                             rideStatus === 'enroute' ? 'Driver is En Route' : 'Driver Arrived'}
                          </h3>
                          <p className="text-xs text-ink/60">
                            {rideStatus === 'searching' ? 'Connecting with nearby luxury vehicles' : 
                             rideStatus === 'enroute' ? 'Estimated arrival: 4 mins' : 'Your driver is waiting outside'}
                          </p>
                        </div>
                      </div>
                      {rideStatus === 'arrived' && <CheckCircle2 className="text-emerald-500" size={24} />}
                    </div>

                    {rideStatus !== 'searching' && (
                      <div className="p-4 bg-paper rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={VEHICLES[selectedCar].driver.photo} className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="text-sm font-bold text-ink">{VEHICLES[selectedCar].driver.name}</p>
                            <div className="flex items-center gap-1 text-gold text-[10px]">
                              <Star size={10} fill="currentColor" />
                              <span>{VEHICLES[selectedCar].driver.rating}</span>
                              <span className="text-ink/40 ml-1">• {VEHICLES[selectedCar].driver.trips} trips</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-card rounded-full text-ink hover:bg-paper transition-colors border border-border"><Phone size={16} /></button>
                          <button className="p-2 bg-card rounded-full text-ink hover:bg-paper transition-colors border border-border"><MessageSquare size={16} /></button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-ink/40 uppercase tracking-widest font-bold">Vehicle</span>
                        <span className="text-ink font-bold">{VEHICLES[selectedCar].name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink/40 uppercase tracking-widest font-bold">Plate</span>
                        <span className="text-ink font-bold">{VEHICLES[selectedCar].driver.carPlate}</span>
                      </div>
                    </div>

                    {rideStatus === 'arrived' ? (
                      <button 
                        onClick={() => setRideStatus('idle')}
                        className="w-full btn-luxury py-4"
                      >
                        Complete Ride
                      </button>
                    ) : (
                      <button 
                        onClick={() => setRideStatus('idle')}
                        className="w-full py-4 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                      >
                        Cancel Ride
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-display text-ink ml-2">Available Vehicles</h3>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 no-scrollbar">
            {filteredVehicles.map((car) => (
              <motion.div
                key={car.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCar(car.id)}
                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex gap-4 ${
                  selectedCar === car.id ? 'border-gold bg-gold/5' : 'border-border bg-card hover:border-gold/30'
                }`}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                  <img src={car.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-ink">{car.name}</h4>
                    <div className="flex items-center gap-0.5 text-gold">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-bold">{car.stars}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-ink/40 uppercase tracking-widest">{car.type}</p>
                  <p className="text-[10px] text-ink/60 italic">{car.company}</p>
                  <div className="flex justify-between items-end pt-1">
                    <div className="flex items-center gap-1 text-ink/40">
                      <Clock size={10} />
                      <span className="text-[10px]">3-5 mins</span>
                    </div>
                    <span className="text-sm font-bold text-ink">€{car.basePrice}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxiPage;
