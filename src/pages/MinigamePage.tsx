import React, { useState } from 'react';
import { Gamepad2, Trophy, Star, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MinigamePage: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
  const [score, setScore] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    // Simple game logic placeholder
    setTimeout(() => {
      setGameState('won');
      setScore(500);
    }, 3000);
  };

  return (
    <div className="space-y-8 py-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">ItaliaGo Challenge</h2>
          <p className="text-sm text-gray-500">Play daily to earn bonus points and rewards</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100">
            <Trophy size={16} className="text-yellow-600" />
            <span className="text-sm font-bold text-yellow-700">Rank #42</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-[3rem] aspect-[21/9] relative overflow-hidden flex items-center justify-center border-8 border-gray-800 shadow-2xl">
        {/* Game Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#7C3AED] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8 relative z-10"
            >
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/20">
                <Gamepad2 size={40} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white">Ready for the Challenge?</h3>
                <p className="text-gray-400">Test your knowledge of Italian culture and earn points.</p>
              </div>
              <button 
                onClick={startGame}
                className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold hover:bg-[#7C3AED] hover:text-white transition-all flex items-center gap-3 mx-auto"
              >
                <Play size={20} fill="currentColor" />
                Start Playing
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white font-medium tracking-widest uppercase text-xs">Loading Challenge...</p>
            </motion.div>
          )}

          {gameState === 'won' && (
            <motion.div
              key="won"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map(i => (
                  <Star key={i} size={32} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-white">Victory!</h3>
                <p className="text-gray-400">You've earned <span className="text-white font-bold">+{score} points</span></p>
              </div>
              <button 
                onClick={() => setGameState('idle')}
                className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6D28D9] transition-all"
              >
                Claim Reward
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Leaderboard</h4>
            <p className="text-sm text-gray-500">See how you rank against other travelers.</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Star size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Daily Streaks</h4>
            <p className="text-sm text-gray-500">Play 5 days in a row for a 2x multiplier.</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">New Games</h4>
            <p className="text-sm text-gray-500">New challenges added every Monday.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinigamePage;
