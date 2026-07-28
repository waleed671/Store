'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Star, 
  Rotate3d, 
  ChevronRight,
  Minus,
  Plus
} from 'lucide-react';
import { useCartStore } from '../../../store/useCartStore';
import { useWishlistStore } from '../../../store/useWishlistStore';
import api from '../../../lib/api';
import dynamic from 'next/dynamic';

const Watch3DCanvas = dynamic(() => import('../../../components/hero/Watch3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center text-black text-xs font-bold uppercase tracking-widest animate-pulse">
      Loading 3D Watch Model...
    </div>
  ),
});

const MOCK_DETAIL = {
  _id: 'lunarix-one-flagship',
  name: 'CHRONEX Lunarix One - Deep Space Edition',
  brand: 'CHRONEX',
  price: 2499,
  salePrice: 1999,
  description: 'Forged from Grade 5 Titanium alloy, the CHRONEX Lunarix One features a manufacture L-9001 automatic flying tourbillon movement. Complete with double-curved anti-reflective sapphire crystal and 300-meter water resistance.',
  sku: 'CHX-LUNARIX-01',
  stock: 12,
  images: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1000&auto=format&fit=crop&q=80',
  ],
  specifications: {
    'Movement': 'Manufacture L-9001 Automatic Flying Tourbillon',
    'Power Reserve': '72 Hours (3 Days)',
    'Case Diameter': '42.0 mm',
    'Case Thickness': '12.8 mm',
    'Case Material': 'Aerospace Grade 5 Titanium (Micro-blasted)',
    'Crystal': 'Double Curved Scratch-Resistant Sapphire',
    'Water Resistance': '30 Bar (300 Meters / 1000 Feet)',
    'Frequency': '28,800 VPH / 4 Hz',
    'Strap': 'Interchangeable Titanium Bracelet & Rubber',
  },
  ratings: { average: 4.5, count: 48 },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(MOCK_DETAIL);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('obsidian');
  const [selectedSize, setSelectedSize] = useState('42mm');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'photos' | '3d'>('photos');

  const addItem = useCartStore((s) => s.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isLiked = isInWishlist(product._id);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setProduct(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor, selectedSize);
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white text-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SHOP.CO Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/shop" className="hover:text-black uppercase">Shop</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-black font-bold uppercase">{product.name}</span>
        </div>

        {/* SHOP.CO Product Detail Layout: Images Left + Info Right with 3D Motion */}
        <motion.div
          initial={{ opacity: 0, y: 25, rotateX: 4 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
        >
          
          {/* Left Column: Thumbnails & Main Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* View Tab Switcher */}
            <div className="flex justify-between items-center pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                    activeTab === 'photos' ? 'bg-black text-white' : 'bg-[#F0F0F0] text-black hover:bg-slate-200'
                  }`}
                >
                  High-Res Gallery
                </button>
                <button
                  onClick={() => setActiveTab('3d')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                    activeTab === '3d' ? 'bg-black text-white' : 'bg-[#F0F0F0] text-black hover:bg-slate-200'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" /> 3D Interactive
                </button>
              </div>
            </div>

            {/* Display Box */}
            {activeTab === '3d' ? (
              <div className="bg-[#F0EEED] rounded-3xl p-4 border border-slate-200">
                <Watch3DCanvas selectedColor={selectedColor} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Thumbnails */}
                <div className="sm:col-span-1 order-2 sm:order-1 flex sm:flex-col gap-3">
                  {product.images?.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-[#F0EEED] border transition-all p-2 ${
                        selectedImage === index
                          ? 'border-black ring-2 ring-black/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>

                {/* Main Large Photo */}
                <div className="sm:col-span-3 order-1 sm:order-2 relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F0EEED] border border-slate-200 p-6">
                  <img
                    src={product.images?.[selectedImage] || product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`absolute top-4 right-4 p-3 rounded-full bg-white/80 border border-slate-200 backdrop-blur-md transition-all ${
                      isLiked ? 'text-red-500 bg-red-50 border-red-200' : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Title, Price, Color, Size, Add to Cart */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Ratings */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter leading-tight">
                {product.name}
              </h1>

              {/* SHOP.CO Star Rating Score (4.5/5) */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-black text-sm">4.5/<span className="text-slate-400">5</span></span>
              </div>

              {/* SHOP.CO Price & Discount Pill */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-3xl font-black text-black">
                  ${(product.salePrice || product.price).toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-slate-400 line-through font-bold">
                      ${product.price.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-black rounded-full">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal pt-2">
                {product.description}
              </p>
            </div>

            {/* Select Colors Swatches */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Select Finish:
              </span>
              <div className="flex gap-3">
                {[
                  { id: 'obsidian', class: 'bg-[#1E293B]' },
                  { id: 'gold', class: 'bg-[#D97706]' },
                  { id: 'cyan', class: 'bg-[#06B6D4]' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-9 h-9 rounded-full ${c.class} transition-all ${
                      selectedColor === c.id ? 'ring-2 ring-black ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Select Size / Diameter */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Choose Size:
              </span>
              <div className="flex flex-wrap gap-3">
                {['38mm', '40mm', '42mm', '44mm'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-3 rounded-full text-xs font-bold transition-all ${
                      selectedSize === size ? 'bg-black text-white' : 'bg-[#F0F0F0] text-black hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Solid Black Add to Cart Button */}
            <div className="flex gap-4 pt-2">
              {/* Quantity Counter */}
              <div className="flex items-center gap-4 bg-[#F0F0F0] rounded-full px-5 py-3 text-black font-bold">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-slate-600">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-black min-w-[20px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="hover:text-slate-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* SHOP.CO Solid Black Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

          </div>

        </motion.div>

        {/* Technical Specifications Box */}
        <div className="bg-[#F0F0F0] p-8 sm:p-10 rounded-[32px] space-y-6">
          <h3 className="text-xl font-black text-black uppercase tracking-tight">
            Technical Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            {Object.entries(product.specifications || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 border-b border-slate-300">
                <span className="text-slate-500">{key}:</span>
                <span className="text-black font-bold">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
