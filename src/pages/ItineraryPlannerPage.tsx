import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Sparkles, MapPin, Calendar, Send, Bot, User, Loader2, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

const ItineraryPlannerPage: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('3');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);

  const generateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setItinerary(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a detailed ${duration}-day travel itinerary for ${destination}. 
                   Interests: ${interests}. 
                   Focus on authentic Italian experiences, local food, and hidden gems. 
                   Format with clear headings for each day and bullet points for activities.`,
        config: {
          systemInstruction: "You are an expert Italian travel guide with deep local knowledge of every region in Italy.",
        }
      });

      setItinerary(response.text || "Sorry, I couldn't generate an itinerary at this time.");
    } catch (error) {
      console.error("AI Generation failed:", error);
      setItinerary("An error occurred while generating your itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <Navbar onAuthClick={() => {}} onAIClick={() => {}} onAdminClick={() => {}} />
      
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            AI-Powered Planning
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Your Personal Italian Concierge</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Tell us your dream destination and interests, and our AI will craft a bespoke itinerary just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-24">
              <form onSubmit={generateItinerary} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="e.g. Florence, Amalfi Coast" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">Duration (Days)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <select 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all text-sm appearance-none"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(d => (
                        <option key={d} value={d}>{d} Days</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">Interests & Preferences</label>
                  <textarea 
                    placeholder="e.g. Art history, wine tasting, hiking, local pasta workshops..." 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[120px]"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading || !destination}
                  className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Crafting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Itinerary
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl border border-stone-200 p-12 flex flex-col items-center justify-center text-center min-h-[500px]"
                >
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Bot size={40} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Consulting our local experts...</h3>
                  <p className="text-stone-500 max-w-xs">Our AI is currently mapping out the perfect route through {destination}. This usually takes 10-15 seconds.</p>
                </motion.div>
              ) : itinerary ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-stone-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Your Custom Itinerary</h3>
                        <p className="text-xs text-stone-400">Generated by ItaliaGo AI</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download PDF">
                        <Download size={18} />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Share">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-8 prose prose-stone max-w-none">
                    <div className="markdown-body">
                      <Markdown>{itinerary}</Markdown>
                    </div>
                  </div>
                  <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-center">
                    <button 
                      onClick={() => setItinerary(null)}
                      className="text-stone-500 text-sm font-bold hover:text-stone-900 transition-colors"
                    >
                      Plan another trip
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                    <Bot size={32} className="text-stone-300" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-400 mb-2">Ready to explore?</h3>
                  <p className="text-stone-400 max-w-xs">Fill out the form to generate your personalized Italian travel plan.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ItineraryPlannerPage;
