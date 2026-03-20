import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, X } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
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
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: name,
          role: 'user',
          bonus: 0,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          createdAt: new Date().toISOString()
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
        className="relative w-full max-w-md bg-card rounded-[2rem] overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 mx-4"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-display italic text-ink">
            {mode === 'login' ? 'Welcome Back' : 'Join ItaliaGo'}
          </h2>
          <p className="text-ink/60 text-sm">
            {mode === 'login' ? 'Sign in to access your luxury travel suite.' : 'Create an account for exclusive Italian experiences.'}
          </p>
        </div>

        <div className="flex p-1 bg-paper rounded-full">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-card shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-card shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-luxury py-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <button 
          onClick={onClose}
          className="w-full text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default AuthModal;
