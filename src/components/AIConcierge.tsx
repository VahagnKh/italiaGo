import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, Globe } from 'lucide-react';
import { getTravelAdvice } from '../services/gemini';

const BOT_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Welcome! I am your ItaliaGo Concierge. How can I make your Italian escape unforgettable today?' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', greeting: 'Benvenuto! Sono il tuo Concierge ItaliaGo. Come posso rendere indimenticabile la tua fuga italiana oggi?' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', greeting: 'Добро пожаловать! Я ваш консьерж ItaliaGo. Как я могу сделать ваш итальянский отдых незабываемым сегодня?' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲', greeting: 'Բարի գալուստ: Ես ձեր ItaliaGo կոնսիերժն եմ: Ինչպե՞ս կարող եմ ձեր իտալական հանգիստն այսօր անմոռանալի դարձնել:' },
];

export default function AIConcierge({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedLang]);

  const handleLangSelect = (langCode: string) => {
    setSelectedLang(langCode);
    const lang = BOT_LANGUAGES.find(l => l.code === langCode);
    if (lang) {
      setMessages([{ role: 'assistant', content: lang.greeting }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedLang) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const langName = BOT_LANGUAGES.find(l => l.code === selectedLang)?.name || 'English';
    const promptWithLang = `Please respond in ${langName}. User says: ${userMsg}`;

    const response = await getTravelAdvice(promptWithLang);
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that." }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-ink text-paper rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-500 z-50"
      >
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-card rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden z-50 border border-border transition-colors duration-500"
          >
            <div className="bg-ink p-4 text-paper flex justify-between items-center transition-colors duration-500">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-gold" />
                <span className="font-display text-lg">ItaliaGo Concierge</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedLang && (
                  <button 
                    onClick={() => setSelectedLang(null)} 
                    className="p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors"
                    title="Change Language"
                  >
                    <Globe size={16} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper/50 transition-colors duration-500">
              {!selectedLang ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gold/20 blur-2xl rounded-full animate-pulse" />
                    <Bot size={64} className="relative text-ink" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-display italic text-ink">Benvenuti</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink/60">
                      Select your language
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-[280px]">
                    {BOT_LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => handleLangSelect(l.code)}
                        className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-gold hover:shadow-lg transition-all group shadow-sm"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">{l.flag}</span>
                        <span className="text-xs font-bold text-ink tracking-wider">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm transition-colors duration-500 ${
                        msg.role === 'user' 
                          ? 'bg-ink text-paper rounded-tr-none shadow-md' 
                          : 'bg-card border border-border text-ink rounded-tl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-white/10 border border-black/5 dark:border-white/5 p-3 rounded-2xl rounded-tl-none transition-colors duration-500">
                        <motion.div 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="flex gap-1"
                        >
                          <div className="w-1.5 h-1.5 bg-ink/30 dark:bg-white/30 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-ink/30 dark:bg-white/30 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-ink/30 dark:bg-white/30 rounded-full" />
                        </motion.div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedLang && (
              <div className="p-4 border-t border-border bg-card flex gap-2 transition-colors duration-500">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your concierge..."
                  className="flex-1 bg-paper/50 border border-border rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-ink outline-none text-ink transition-all duration-500"
                />
                <button 
                  onClick={handleSend}
                  className="w-10 h-10 bg-ink text-paper rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-500"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

