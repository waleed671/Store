import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Star, ChevronRight } from 'lucide-react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import api from '../../lib/api';

const MOCK_FALLBACK_PRODUCTS = [
  {
    _id: 'lunarix-one-flagship',
    slug: 'lunarix-one-flagship',
    name: 'CHRONEX Lunarix One - Deep Space Edition',
    brand: 'CHRONEX',
    price: 2499,
    salePrice: 1999,
    description: 'Grade 5 Titanium Tourbillon Watch.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    ratings: { average: 4.5, count: 48 },
  },
  {
    _id: 'solar-gold-chronograph',
    slug: 'solar-gold-chronograph',
    name: 'CHRONEX Solar Gold Chronograph',
    brand: 'CHRONEX',
    price: 3200,
    salePrice: 2800,
    description: 'Solid Gold Dial Mechanical Chronograph.',
    images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800'],
    ratings: { average: 5.0, count: 32 },
  },
  {
    _id: 'obsidian-deep-diver',
    slug: 'obsidian-deep-diver',
    name: 'CHRONEX Obsidian Deep Diver 300M',
    brand: 'CHRONEX',
    price: 1850,
    salePrice: 1550,
    description: '300-Meter Professional Diver Watch.',
    images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800'],
    ratings: { average: 4.8, count: 19 },
  },
  {
    _id: 'starlight-monolith-automatic',
    slug: 'starlight-monolith-automatic',
    name: 'CHRONEX Starlight Monolith Automatic',
    brand: 'CHRONEX',
    price: 2100,
    salePrice: 1750,
    description: 'Sapphire Crystal Skeleton Automatic.',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'],
    ratings: { average: 4.9, count: 27 },
  },
];

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const [allProducts, setAllProducts] = useState<any[]>(MOCK_FALLBACK_PRODUCTS);

  useEffect(() => {
    api.get('/products?limit=100')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          const list = res.data.data.products || res.data.data || [];
          if (list.length > 0) {
            setAllProducts(list);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Filter ONLY products that the user explicitly added to their wishlist
  const favoritedProducts = allProducts.filter((p) => 
    wishlist.includes(p._id) || wishlist.includes(p.slug) || wishlist.includes(p.id)
  );

  return (
    <div className="min-h-screen bg-white text-black py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SHOP.CO Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-black font-bold uppercase">My Favourites</span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter">
            MY FAVOURITE PRODUCTS ({favoritedProducts.length})
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Your personal collection of saved luxury timepieces.
          </p>
        </div>

        {/* Display ONLY Wishlist Products */}
        {favoritedProducts.length === 0 ? (
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-[32px] p-12 text-center space-y-6 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F0EEED] flex items-center justify-center text-slate-400 mx-auto">
              <Heart className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-black uppercase">YOUR WISHLIST IS EMPTY</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                You haven't saved any products to your favourites yet. Click the heart icon on any watch model to add it to your wishlist!
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" /> Explore Watch Catalog
            </Link>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {favoritedProducts.map((product) => {
              const hasDiscount = product.salePrice && product.salePrice < product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                : 0;

              return (
                <motion.div
                  key={product._id || product.slug}
                  variants={{
                    hidden: { opacity: 0, y: 25, rotateX: 6 },
                    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.4 } },
                  }}
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 p-4 space-y-4 hover:border-black transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Photo Box */}
                    <div className="relative aspect-square w-full rounded-2xl bg-[#F0EEED] overflow-hidden p-4">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Trash / Remove from Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product._id || product.slug)}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 border border-slate-200 text-red-500 shadow-md hover:bg-red-50 transition-all"
                        title="Remove from Favourites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <Link href={`/product/${product.slug || product._id}`}>
                        <h3 className="font-black text-sm text-black line-clamp-1 uppercase tracking-tight hover:underline">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="font-bold text-black text-xs">4.5/<span className="text-slate-400">5</span></span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xl font-black text-black">
                          ${(product.salePrice || product.price).toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="text-xs text-slate-400 line-through font-bold">
                              ${product.price.toLocaleString()}
                            </span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full">
                              -{discountPercent}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addItem(product, 1)}
                    className="w-full py-3.5 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>
    </div>
  );
}
