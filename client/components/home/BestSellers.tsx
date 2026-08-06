import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import api from '../../lib/api';

export default function BestSellers() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products?limit=4')
      .then((res) => {
        if (res.data?.success && res.data?.data?.products) {
          setProducts(res.data.data.products);
        }
      })
      .catch(() => {
        // Fallback demo data
        setProducts([
          {
            _id: 't1',
            name: 'CHRONEX Solar Gold Chronograph',
            price: 3200,
            salePrice: 2800,
            ratings: 5.0,
            slug: 'solar-gold-edition',
            images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800'],
          },
          {
            _id: 't2',
            name: 'CHRONEX Obsidian Deep Diver 300M',
            price: 1850,
            salePrice: 1500,
            ratings: 4.8,
            slug: 'obsidian-deep-diver',
            images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'],
          },
          {
            _id: 't3',
            name: 'CHRONEX Lunarix One Deep Space',
            price: 2499,
            salePrice: 1999,
            ratings: 4.5,
            slug: 'lunarix-one-flagship',
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
          },
          {
            _id: 't4',
            name: 'CHRONEX Heritage Tourbillon',
            price: 4100,
            salePrice: 3500,
            ratings: 4.9,
            slug: 'heritage-tourbillon',
            images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800'],
          },
        ]);
      });
  }, []);

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* SHOP.CO Centered Header: TOP SELLING */}
        <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tighter uppercase text-center">
          TOP SELLING
        </h2>

        {/* 4-Column Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id || p.slug} product={p} />
          ))}
        </div>

        {/* SHOP.CO View All Pill Button */}
        <div className="text-center pt-4">
          <Link
            to="/shop"
            className="inline-block w-full sm:w-auto px-16 py-4 bg-white border border-slate-200 text-black hover:bg-black hover:text-white font-bold text-sm tracking-wider uppercase rounded-full shadow-sm transition-all text-center"
          >
            View All
          </Link>
        </div>

      </div>
    </section>
  );
}
