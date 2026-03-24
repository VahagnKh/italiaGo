import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, X, ArrowRight } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create Firestore user document if it doesn't exist
      const isAdmin = user.email === 'ekyuregh@gmail.com';
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        role: isAdmin ? 'admin' : 'user',
        wallet_balance: 0,
        bonus: 0,
        status: 'Normal',
        avatar_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        created_at: new Date().toISOString()
      }, { merge: true });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update Firebase Auth profile
        await updateProfile(user, { displayName: name });
        
        // Create Firestore user document
        const isAdmin = user.email === 'ekyuregh@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email: user.email,
          name: name,
          role: isAdmin ? 'admin' : 'user',
          wallet_balance: 0,
          bonus: 0,
          status: 'Normal',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          created_at: new Date().toISOString()
        });
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md glass-light rounded-[2.5rem] overflow-hidden shadow-2xl p-8 sm:p-12 space-y-8 mx-4"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-ink text-paper rounded-2xl flex items-center justify-center font-display text-3xl italic mx-auto mb-6 shadow-xl">
            I
          </div>
          <h2 className="text-3xl sm:text-4xl font-display italic text-ink">
            {mode === 'login' ? 'Welcome Back' : 'Join ItaliaGo'}
          </h2>
          <p className="text-ink/60 text-sm italic">
            {mode === 'login' ? 'Sign in to access your luxury travel suite.' : 'Create an account for exclusive Italian experiences.'}
          </p>
        </div>

        <div className="flex p-1 bg-paper/50 rounded-full border border-border">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-white shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Full Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-paper/50 border border-border rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-gold text-ink transition-all" 
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
              <input 
                type="email" 
                placeholder="john@example.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-paper/50 border border-border rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-gold text-ink transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-paper/50 border border-border rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-gold text-ink transition-all" 
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[10px] text-center font-bold uppercase tracking-widest"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-luxury py-5 flex items-center justify-center gap-3 shadow-xl"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-transparent px-4 text-ink/40">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-4 bg-white border border-border rounded-2xl py-4 hover:bg-paper transition-all group shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Google Account</span>
        </button>

        <button 
          onClick={onClose}
          className="w-full text-[10px] font-bold uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default AuthModal;
