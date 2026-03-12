import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">I</div>
              <span className="text-xl font-bold tracking-tight text-white">Italia<span className="text-emerald-600">Go</span></span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your ultimate companion for exploring the beauty, culture, and flavors of Italy. From historic tours to luxury stays.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Hotels</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Restaurants</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Tours</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Experiences</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Help Center</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Safety Information</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Cancellation Options</Link></li>
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Get travel tips and exclusive offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-stone-800 border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500"
              />
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2026 ItaliaGo. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <Link to="/" className="hover:text-white">Privacy Policy</Link>
            <Link to="/" className="hover:text-white">Terms of Service</Link>
            <Link to="/" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
