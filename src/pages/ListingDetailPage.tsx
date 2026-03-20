import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, MapPin, Calendar, Users, Heart, Share2, ArrowLeft, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`); // Note: server.ts has /api/:type/:id, but I'll adjust it
        const data = await res.json();
        setListing(data);
      } catch (error) {
        console.error("Fetch listing failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!bookingDate) {
      alert("Please select a date");
      return;
    }

    setBookingLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: id,
          listing_type: listing.category,
          date: bookingDate,
          guests,
          amount: listing.price * guests,
          title: listing.title || listing.name
        })
      });
      
      if (res.ok) {
        const booking = await res.json();
        // Redirect to payment or success
        alert("Booking request sent! Go to dashboard to complete payment.");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!listing) return <div className="flex flex-col items-center justify-center h-screen">
    <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
    <button onClick={() => navigate('/')} className="text-emerald-600 font-bold underline">Back to Home</button>
  </div>;

  const title = listing.title || listing.name;
  const rating = listing.rating || listing.stars || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onAuthClick={() => {}} onAIClick={() => {}} onAdminClick={() => {}} />
      
      <main className="flex-grow bg-white">
        {/* Header & Gallery */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={16} fill="currentColor" />
                  <span>{rating.toFixed(1)}</span>
                  <span className="text-stone-400 font-normal">({listing.reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-stone-500">
                  <MapPin size={16} />
                  <span className="underline">{listing.location}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-sm font-medium">
                <Share2 size={16} />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-sm font-medium">
                <Heart size={16} />
                Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px] rounded-3xl overflow-hidden">
            <div className="md:col-span-2 h-full">
              <img src={listing.image} alt={title} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" referrerPolicy="no-referrer" />
            </div>
            <div className="hidden md:grid grid-cols-1 gap-4 md:col-span-1 h-full">
              <img src={`https://picsum.photos/seed/${id}1/800/600`} alt={title} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" referrerPolicy="no-referrer" />
              <img src={`https://picsum.photos/seed/${id}2/800/600`} alt={title} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" referrerPolicy="no-referrer" />
            </div>
            <div className="hidden md:grid grid-cols-1 gap-4 md:col-span-1 h-full">
              <img src={`https://picsum.photos/seed/${id}3/800/600`} alt={title} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" referrerPolicy="no-referrer" />
              <div className="relative h-full">
                <img src={`https://picsum.photos/seed/${id}4/800/600`} alt={title} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" referrerPolicy="no-referrer" />
                <button className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold hover:bg-black/50 transition-colors">
                  Show all photos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content & Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-stone-900 mb-4">About this {listing.category.toLowerCase()}</h2>
                <p className="text-stone-600 leading-relaxed mb-6">
                  {listing.description || "Experience the best of Italy with this exclusive listing. Located in the heart of the region, it offers a unique blend of tradition and modern comfort."}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                    <div>
                      <p className="text-sm font-bold text-stone-900">Verified</p>
                      <p className="text-xs text-stone-500">ItaliaGo Certified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl">
                    <ShieldCheck className="text-emerald-600" size={20} />
                    <div>
                      <p className="text-sm font-bold text-stone-900">Secure</p>
                      <p className="text-xs text-stone-500">Protected Booking</p>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-stone-100 mb-10" />

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                  <div className="flex items-center gap-3 text-stone-600">
                    <Clock size={20} />
                    <span>Duration: {listing.duration || "Flexible"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <MapPin size={20} />
                    <span>Location: {listing.location}</span>
                  </div>
                  {/* Add more amenities based on category */}
                </div>
              </section>

              <hr className="border-stone-100 mb-10" />

              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <Star size={24} fill="currentColor" className="text-amber-500" />
                    {rating.toFixed(1)} · {listing.reviews?.length || 0} reviews
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {listing.reviews?.length > 0 ? (
                    listing.reviews.map((review: any) => (
                      <div key={review.id} className="bg-stone-50 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-bold text-stone-500">
                            {review.user_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-stone-900">{review.user_name}</p>
                            <p className="text-xs text-stone-500">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex text-amber-500 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <p className="text-sm text-stone-600 italic">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-500 italic">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-stone-200 rounded-3xl shadow-xl p-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-2xl font-bold text-stone-900">€{listing.price}</span>
                    <span className="text-stone-500 text-sm ml-1">/ person</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-900 text-sm font-bold">
                    <Star size={16} fill="currentColor" className="text-amber-500" />
                    {rating.toFixed(1)}
                  </div>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-1 gap-0 border border-stone-200 rounded-2xl overflow-hidden">
                    <div className="p-3 border-b border-stone-200">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-transparent border-none p-0 text-sm focus:ring-0"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="p-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Guests</label>
                      <select 
                        className="w-full bg-transparent border-none p-0 text-sm focus:ring-0"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Processing...' : 'Reserve Now'}
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>€{listing.price} x {guests} guests</span>
                    <span>€{listing.price * guests}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>Service fee</span>
                    <span>€0</span>
                  </div>
                  <hr className="border-stone-100" />
                  <div className="flex justify-between text-stone-900 font-bold">
                    <span>Total</span>
                    <span>€{listing.price * guests}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-stone-400 text-xs">
                  <ShieldCheck size={14} />
                  <span>Secure Payment via Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetailPage;
