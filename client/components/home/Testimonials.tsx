'use client';

import React from 'react';
import { Star, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      comment: '"I am blown away by the quality and craftsmanship. The flying tourbillon movement operates smoothly and the titanium case feels incredibly light on the wrist."',
    },
    {
      id: 2,
      name: 'Alex K.',
      rating: 5,
      comment: '"Finding a luxury timepiece that matches my personal style used to be difficult until I found CHRONEX. Fast delivery and exceptional customer support!"',
    },
    {
      id: 3,
      name: 'James L.',
      rating: 5,
      comment: '"As a watch collector, the Lunarix One is easily one of the highlights of my collection. The 3D interactive preview was spot on with the actual watch."',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SHOP.CO Header: OUR HAPPY CUSTOMERS with Navigation Arrows */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tighter uppercase">
            OUR HAPPY CUSTOMERS
          </h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-black hover:bg-slate-100 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-black hover:bg-slate-100 transition-all">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SHOP.CO Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-7 rounded-3xl border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition-all">
              {/* Amber 5-Star Rating */}
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-current" />
                ))}
              </div>

              {/* Customer Name with Verified Checkmark */}
              <div className="flex items-center gap-1.5 font-bold text-black text-base">
                <span>{rev.name}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              </div>

              {/* Customer Review Quote */}
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
