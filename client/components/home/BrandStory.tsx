'use client';

import React from 'react';
import Link from 'next/link';

export default function BrandStory() {
  const dressStyles = [
    {
      id: 'casual',
      title: 'Casual',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      colSpan: 'lg:col-span-4',
    },
    {
      id: 'formal',
      title: 'Formal',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      colSpan: 'lg:col-span-8',
    },
    {
      id: 'party',
      title: 'Party',
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format&fit=crop&q=80',
      colSpan: 'lg:col-span-8',
    },
    {
      id: 'gym',
      title: 'Gym & Sport',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      colSpan: 'lg:col-span-4',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SHOP.CO Off-white Gray Container #F0F0F0 */}
        <div className="bg-[#F0F0F0] rounded-[40px] p-8 sm:p-14 space-y-10">
          
          {/* Section Header */}
          <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tighter uppercase text-center">
            BROWSE BY DRESS STYLE
          </h2>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {dressStyles.map((style) => (
              <Link
                key={style.id}
                href={`/shop?category=${style.id}`}
                className={`${style.colSpan} relative h-[280px] rounded-3xl overflow-hidden bg-white group shadow-sm hover:shadow-xl transition-all duration-500 block p-8`}
              >
                {/* Style Title */}
                <span className="font-black text-2xl sm:text-3xl text-black tracking-tight relative z-10 block">
                  {style.title}
                </span>

                {/* Card Photo Background */}
                <img
                  src={style.image}
                  alt={style.title}
                  className="absolute right-0 top-0 h-full w-2/3 object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
