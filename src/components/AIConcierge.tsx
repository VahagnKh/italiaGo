import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, Globe, ChevronDown } from 'lucide-react';
import { getTravelAdvice } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIConcierge({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.botGreeting }]);
    }
  }, [isOpen, t.botGreeting]);

  // Update greeting if language changes and it's the only message
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: t.botGreeting }]);
    }
  }, [t.botGreeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const langName = language === 'it' ? 'Italian' : language === 'ru' ? 'Russian' : language === 'hy' ? 'Armenian' : 'English';
    const promptWithLang = `Please respond in ${langName}. User says: ${userMsg}`;

    const response = await getTravelAdvice(promptWithLang);
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that." }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-ink text-paper rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-500 z-[60] group"
      >
        <Bot size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isExpanded ? '90vh' : '500px',
              width: isExpanded ? '95vw' : '384px',
              bottom: isExpanded ? '2.5vh' : '96px',
              right: isExpanded ? '2.5vw' : '24px',
            }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className={`fixed z-[70] bg-card rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-border transition-all duration-500 ease-out sm:max-w-md ${
              isExpanded ? 'left-[2.5vw]' : 'left-4 sm:left-auto'
            }`}
          >
            {/* Header */}
            <div className="bg-ink p-6 text-paper flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg leading-tight">ItaliaGo Concierge</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">AI-Powered Travel Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Globe size={16} />
                    <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
                  </button>
                  <AnimatePresence>
                    {showLangMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-32 bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-50 p-1"
                      >
                        {LANGUAGES.map(l => (
                          <button
                            key={l.code}
                            onClick={() => { setLanguage(l.code as any); setShowLangMenu(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${language === l.code ? 'bg-gold text-white' : 'text-ink hover:bg-paper'}`}
                          >
                            <span>{l.flag}</span>
                            <span>{l.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                >
                  {isExpanded ? <ChevronDown size={20} /> : <div className="w-5 h-5 border-2 border-white/40 rounded-sm" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-paper/30 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-ink text-paper rounded-tr-none shadow-lg' 
                      : 'bg-card border border-border text-ink rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                          className="w-1.5 h-1.5 bg-gold rounded-full" 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-border bg-card shrink-0">
              <div className="relative flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.botPlaceholder}
                  className="flex-1 bg-paper/50 border border-border rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-gold outline-none text-ink transition-all placeholder:text-ink/30"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-ink text-paper rounded-2xl flex items-center justify-center hover:bg-gold transition-all disabled:opacity-50 disabled:hover:bg-ink shadow-lg"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

