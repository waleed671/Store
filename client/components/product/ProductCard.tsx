import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye, CheckCircle2, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    salePrice?: number;
    images: string[];
    slug: string;
    ratings?: { average: number; count: number };
    isFeatured?: boolean;
    isNewArrival?: boolean;
    stock: number;
    numReviews?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0, glossX: 50, glossY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const isLiked = isInWishlist(product._id);
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  // Handle 3D Mouse Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // tilt max 12 deg
    const rotateY = ((x - centerX) / centerX) * 12;

    const glossX = (x / rect.width) * 100;
    const glossY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glossX, glossY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glossX: 50, glossY: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl transition-transform duration-200 ease-out cursor-pointer"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }}
    >
      {/* Dynamic Metallic Glow Backing */}
      {/* SHOP.CO White Card Container */}
      <div className="relative flex-1 flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl group-hover:border-slate-300 transition-all duration-500">
        
        {/* SHOP.CO Image container with #F0EEED light background */}
        <div className="relative aspect-square w-full bg-[#F0EEED] overflow-hidden">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded-full shadow-sm tracking-wider">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product._id);
            }}
            className={`absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/80 border border-slate-200 backdrop-blur-md transition-all ${
              isLiked ? 'text-red-500 bg-red-50 border-red-200 scale-110' : 'text-slate-600 hover:text-black'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* 3D Product Image */}
          <Link to={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={(e: any) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </Link>

          {/* Quick View & Add to Cart Hover Controls (SHOP.CO Black Pill Button) */}
          <div className="absolute bottom-3 left-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex gap-2">
            <button
              onClick={() => addItem(product, 1)}
              className="flex-1 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <Link
              to={`/product/${product.slug}`}
              className="p-3 bg-white border border-slate-200 text-slate-800 hover:text-black rounded-full flex items-center justify-center shadow-sm"
              title="Quick 3D View"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product Meta Info (SHOP.CO Light Style) */}
        <div className="p-5 space-y-2 flex-1 flex flex-col justify-between bg-white">
          <div className="space-y-1">
            <Link to={`/product/${product.slug}`}>
              <h3 className="text-base font-black text-black hover:text-slate-600 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* SHOP.CO Star Rating Score (4.5/5) */}
            {(() => {
              const ratingValue =
                typeof product.ratings === 'object' && product.ratings?.average !== undefined
                  ? Number(product.ratings.average)
                  : typeof product.ratings === 'number' && product.ratings > 0
                  ? Number(product.ratings)
                  : 4.5;

              return (
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-black text-xs">{ratingValue.toFixed(1)}/<span className="text-slate-400">5</span></span>
                </div>
              );
            })()}
          </div>

          {/* SHOP.CO Price & Discount Pill */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-black">
                ${(product.salePrice || product.price).toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-slate-400 line-through font-bold">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-extrabold rounded-full">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            <span className="text-[10px] text-emerald-600 font-extrabold uppercase flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> COD
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
