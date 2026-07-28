'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DynamicWatchCanvas = dynamic(() => import('./Watch3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] md:h-[650px] flex items-center justify-center text-cyan-400 text-xs font-bold uppercase tracking-widest animate-pulse">
      Loading 3D Engine...
    </div>
  ),
});

import { 
  Sparkles, 
  Rotate3d,
  Layers,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export default function Hero3DSection() {
  const [selectedColor, setSelectedColor] = useState('obsidian');
  const [isExploded, setIsExploded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const colors = [
    { id: 'obsidian', name: 'Deep Space Obsidian', class: 'bg-slate-900 border-blue-500' },
    { id: 'gold', name: 'Celestial Gold', class: 'bg-amber-500 border-amber-300' },
    { id: 'cyan', name: 'Nebula Cyan', class: 'bg-cyan-500 border-cyan-300' },
    { id: 'rose', name: 'Stellar Rose', class: 'bg-rose-500 border-rose-300' },
  ];

  const handleQuickPreOrder = () => {
    const demoWatchProduct = {
      _id: 'lunarix-one-flagship',
      name: 'CHRONEX Lunarix One - Deep Space Edition',
      brand: 'CHRONEX',
      price: 2499,
      salePrice: 1999,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      slug: 'lunarix-one-flagship',
      sku: 'CHX-LUNARIX-01',
      stock: 12,
    };
    addItem(demoWatchProduct, 1, selectedColor);
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between bg-[#F2F0F1] text-black overflow-hidden pt-6 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - SHOP.CO Style Headline & CTA */}
          <div className="lg:col-span-6 space-y-8 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest text-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>SHOP.CO EXCLUSIVE LUXURY COLLECTION</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black uppercase leading-none">
                FIND WATCHES <br />
                <span>THAT MATCHES YOUR STYLE</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Browse through our diverse range of meticulously crafted luxury timepieces, designed to bring out your individuality and cater to your sense of style.
              </p>
            </div>

            {/* Price & CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleQuickPreOrder}
                className="w-full sm:w-auto px-12 py-4 bg-black text-white hover:bg-slate-800 font-bold text-sm tracking-wider uppercase rounded-full shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Shop Now
              </button>

              <button
                onClick={() => setIsExploded(!isExploded)}
                className={`w-full sm:w-auto px-6 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isExploded 
                    ? 'bg-amber-500 text-white shadow-amber-500/30' 
                    : 'bg-white text-black border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className={`w-4 h-4 ${isExploded ? 'animate-bounce' : ''}`} />
                <span>{isExploded ? 'Assemble 3D Watch' : 'Explode 3D Mechanics'}</span>
              </button>
            </div>

            {/* SHOP.CO Statistics Grid */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-left">
              <div>
                <p className="text-3xl sm:text-4xl font-black text-black tracking-tight">200+</p>
                <p className="text-xs text-slate-500 font-medium">International Brands</p>
              </div>
              <div className="border-x border-slate-300 px-4">
                <p className="text-3xl sm:text-4xl font-black text-black tracking-tight">2,000+</p>
                <p className="text-xs text-slate-500 font-medium">High-Quality Watches</p>
              </div>
              <div className="pl-2">
                <p className="text-3xl sm:text-4xl font-black text-black tracking-tight">30,000+</p>
                <p className="text-xs text-slate-500 font-medium">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Right Column - 3D Interactive Exploded View Watch Canvas */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* 3D Hint Badge */}
            <div className="absolute top-4 right-4 z-20 glass-panel px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center gap-1.5 pointer-events-none shadow-lg">
              <Rotate3d className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>{isExploded ? '💥 3D Exploded Mechanics View' : '3D Interactive • Drag to Rotate'}</span>
            </div>

            {/* 3D Three.js Component */}
            <DynamicWatchCanvas selectedColor={selectedColor} isExploded={isExploded} />
          </div>

        </div>
      </div>

      {/* SHOP.CO Luxury Watch Brand Logo Marquee Ticker Bar */}
      <div id="brands" className="w-full bg-black py-6 border-y border-slate-900 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6 sm:gap-8 text-white font-black text-sm sm:text-xl md:text-2xl tracking-tighter uppercase whitespace-nowrap">
          <span className="hover:text-amber-400 transition-colors cursor-pointer">ROLEX</span>
          <span className="hover:text-amber-400 transition-colors cursor-pointer">HUBLOT</span>
          <span className="hover:text-amber-400 transition-colors cursor-pointer">TISSOT</span>
          <span className="hover:text-amber-400 transition-colors cursor-pointer">PATEK PHILIPPE</span>
          <span className="hover:text-amber-400 transition-colors cursor-pointer">TAG HEUER</span>
          <span className="hover:text-amber-400 transition-colors cursor-pointer">AUDEMARS PIGUET</span>
          <span className="hover:text-amber-400 transition-colors cursor-pointer">OMEGA</span>
          <span className="text-amber-400 hover:text-white transition-colors cursor-pointer">CHRONEX.CO</span>
        </div>
      </div>
    </section>
  );
}
