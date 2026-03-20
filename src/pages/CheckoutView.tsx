import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';

interface CheckoutViewProps {
  basket: any[];
  basketTotal: number;
  onPaymentSuccess: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ basket, basketTotal, onPaymentSuccess }) => {
  const { user, userData } = useAuth();
  const { createBooking } = useBookings();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [bonusEarned, setBonusEarned] = useState(0);

  const minigameDiscount = userData?.last_game_win ? basketTotal * 0.1 : 0;
  const pointsToUse = usePoints ? Math.min(userData?.bonus || 0, Math.floor((basketTotal - minigameDiscount) * 10)) : 0;
  const discount = pointsToUse / 10;
  const finalTotal = basketTotal - minigameDiscount - discount;

  const handlePayment = async () => {
    setIsProcessing(true);
    let totalBonus = 0;
    
    try {
      for (const item of basket) {
        await createBooking({
          type: item.type || 'experience',
          itemId: item.id,
          itemName: item.name,
          amount: item.price,
          details: `${item.location} - ${item.duration || 'Booking'}`,
        });
        // Mock bonus calculation for now since we're using client-side createBooking
        totalBonus += Math.floor(item.price * 0.15);
      }
      
      setBonusEarned(totalBonus);
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        onPaymentSuccess();
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto"
        >
          <Star size={40} />
        </motion.div>
        <h1 className="text-4xl font-display italic text-ink">Payment Successful!</h1>
        <p className="text-ink/60">Your bookings are confirmed. We've sent the details to your email.</p>
        <div className="bg-paper p-6 rounded-3xl border border-border inline-block">
          <p className="text-sm font-bold text-ink uppercase tracking-widest mb-1">Bonus Points Earned</p>
          <p className="text-3xl font-display text-gold">+{bonusEarned}</p>
          <p className="text-[10px] text-ink/40 mt-2 italic">15% of your purchase has been added to your wallet</p>
        </div>
        <div className="pt-8 flex gap-4 justify-center">
          <button onClick={() => navigate('/')} className="btn-luxury">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-display italic text-ink">Complete Your Booking</h1>
            <p className="text-sm sm:text-base text-ink/60">Secure payment via Stripe or PayPal.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-ink rounded-2xl flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-ink rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Card</span>
                </button>
                <button className="p-4 border border-border rounded-2xl flex flex-col items-center gap-2 opacity-50">
                  <div className="w-8 h-8 bg-blue-600 rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">PayPal</span>
                </button>
                <button className="p-4 border border-border rounded-2xl flex flex-col items-center gap-2 opacity-50">
                  <div className="w-8 h-8 bg-gold rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Wallet</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Card Details</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Cardholder Name" className="w-full bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                <input type="text" placeholder="Card Number" className="w-full bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                  <input type="text" placeholder="CVC" className="bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Order Summary</h3>
              <div className="bg-paper/30 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="text-ink font-bold">€{basketTotal.toFixed(2)}</span>
                </div>
                {userData && (userData.bonus || 0) > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="use-points" 
                        checked={usePoints} 
                        onChange={() => setUsePoints(!usePoints)}
                        className="w-4 h-4 accent-gold"
                      />
                      <label htmlFor="use-points" className="text-xs font-bold uppercase tracking-widest text-ink/60 cursor-pointer">
                        Use {pointsToUse} Points for Discount
                      </label>
                    </div>
                    <span className="text-gold font-bold">-€{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg pt-4 border-t border-border">
                  <span className="font-display italic text-ink">Total</span>
                  <span className="font-display text-ink">€{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing || basket.length === 0}
              className="w-full btn-luxury h-14 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>Pay €{finalTotal.toFixed(2)}</>
              )}
            </button>
            <p className="text-center text-[10px] text-ink/40 uppercase tracking-widest">
              Secure SSL Encryption • PCI-DSS Compliant
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-display text-ink">Booking Summary</h3>
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {basket.map((item) => (
                  <div key={item.basketId} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    <img src={item.image || undefined} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-ink">{item.name}</h4>
                      <p className="text-[10px] text-ink/60">{item.location} • {item.duration || 'Experience'}</p>
                      <div className="flex items-center gap-1 text-gold mt-1">
                        {Array.from({ length: item.stars }).map((_, j) => (
                          <Star key={j} size={8} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <span className="font-bold text-ink">€{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
