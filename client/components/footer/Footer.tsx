import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Globe, Share2, MessageCircle, Send } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const pathname = location.pathname;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Hide footer on Auth pages (/auth/login, /auth/register) and Admin pages (/admin/...)
  const isAuthPage = pathname?.startsWith('/auth');
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAuthPage || isAdminPage) {
    return null;
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-white pt-12">
      
      {/* SHOP.CO Floating Newsletter Banner (Solid Black Card #000000) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mb-20">
        <div className="bg-black text-white rounded-[32px] p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none max-w-md text-left">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h3>

          <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-96 space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-black text-xs rounded-full pl-11 pr-4 py-3.5 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-white text-black font-bold text-xs rounded-full hover:bg-slate-200 transition-all uppercase tracking-wider"
            >
              {subscribed ? 'Subscribed Successfully!' : 'Subscribe to Newsletter'}
            </button>
          </form>
        </div>
      </div>

      {/* SHOP.CO Main Footer Body (#F0F0F0 Light Off-White Gray) */}
      <div className="bg-[#F0F0F0] text-black pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Logo & Info */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="font-black text-3xl tracking-tighter text-black uppercase block">
                CHRONEX<span className="text-black">.CO</span>
              </Link>
              <p className="text-slate-600 text-xs max-w-sm leading-relaxed font-normal">
                We have watches that suit your style and which you are proud to wear. From casual daily drivers to high-complication tourbillons.
              </p>
              <div className="flex gap-3 pt-2">
                <a href="#" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all"><Globe className="w-3.5 h-3.5" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-slate-800 transition-all"><Share2 className="w-3.5 h-3.5" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all"><MessageCircle className="w-3.5 h-3.5" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all"><Send className="w-3.5 h-3.5" /></a>
              </div>
            </div>

            {/* Links Column 1: COMPANY */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs tracking-widest text-black uppercase">COMPANY</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link to="/#story" className="hover:text-black">About</Link></li>
                <li><Link to="/shop" className="hover:text-black">Features</Link></li>
                <li><Link to="/shop" className="hover:text-black">Works</Link></li>
                <li><Link to="/shop" className="hover:text-black">Career</Link></li>
              </ul>
            </div>

            {/* Links Column 2: HELP */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs tracking-widest text-black uppercase">HELP</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link to="/account" className="hover:text-black">Customer Support</Link></li>
                <li><Link to="/checkout" className="hover:text-black">Delivery Details</Link></li>
                <li><Link to="/shop" className="hover:text-black">Terms & Conditions</Link></li>
                <li><Link to="/shop" className="hover:text-black">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Links Column 3: FAQ */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs tracking-widest text-black uppercase">FAQ</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link to="/account" className="hover:text-black">Account</Link></li>
                <li><Link to="/account" className="hover:text-black">Manage Deliveries</Link></li>
                <li><Link to="/account?tab=orders" className="hover:text-black">Orders</Link></li>
                <li><Link to="/checkout" className="hover:text-black">Payments</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Payment Method Icons */}
          <div className="pt-8 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-normal">
            <p>CHRONEX.CO © 2000-2026, All Rights Reserved</p>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-white rounded border border-slate-200 text-[10px] font-black text-black">VISA</span>
              <span className="px-2.5 py-1 bg-white rounded border border-slate-200 text-[10px] font-black text-black">Mastercard</span>
              <span className="px-2.5 py-1 bg-white rounded border border-slate-200 text-[10px] font-black text-black">PayPal</span>
              <span className="px-2.5 py-1 bg-white rounded border border-slate-200 text-[10px] font-black text-black">Apple Pay</span>
              <span className="px-2.5 py-1 bg-white rounded border border-slate-200 text-[10px] font-black text-black">G Pay</span>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}
