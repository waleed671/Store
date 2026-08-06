import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../../components/product/ProductCard';
import api from '../../lib/api';
import { Search, SlidersHorizontal, ChevronRight, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const SHOP_WATCHES = [
  {
    _id: 'lunarix-one-flagship',
    name: 'CHRONEX Lunarix One - Deep Space Edition',
    brand: 'CHRONEX',
    price: 2499,
    salePrice: 1999,
    category: 'lunarix-one',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    slug: 'lunarix-one-flagship',
    ratings: { average: 5.0, count: 48 },
    isFeatured: true,
    isNewArrival: true,
    stock: 15,
  },
  {
    _id: 'chronex-titanium-tourbillon',
    name: 'CHRONEX L-9001 Titanium Flying Tourbillon',
    brand: 'CHRONEX',
    price: 3200,
    salePrice: 2850,
    category: 'tourbillon',
    images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'],
    slug: 'chronex-titanium-tourbillon',
    ratings: { average: 4.9, count: 32 },
    isFeatured: true,
    stock: 8,
  },
  {
    _id: 'chronex-solar-gold',
    name: 'CHRONEX Solar Gold Chronograph',
    brand: 'CHRONEX',
    price: 1850,
    category: 'solar-gold',
    images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format&fit=crop&q=80'],
    slug: 'chronex-solar-gold',
    ratings: { average: 4.8, count: 64 },
    isNewArrival: true,
    stock: 20,
  },
  {
    _id: 'chronex-obsidian-diver-300m',
    name: 'CHRONEX Obsidian Deep Diver 300M',
    brand: 'CHRONEX',
    price: 1450,
    salePrice: 1290,
    category: 'obsidian-diver',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'],
    slug: 'chronex-obsidian-diver-300m',
    ratings: { average: 5.0, count: 91 },
    stock: 25,
  },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('collection') || searchParams.get('category') || 'all';

  const [products, setProducts] = useState<any[]>(SHOP_WATCHES);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filterFromUrl = searchParams.get('collection') || searchParams.get('category');
    if (filterFromUrl) {
      setSelectedCategory(filterFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.get('/products?limit=100');
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : (res.data?.data?.products || []);

        if (res.data?.success && list.length > 0) {
          setProducts(list);
        }
      } catch (err) {
        console.warn('Backend fetch fallback to demo watches:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase());
    const brandMatch = p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = !search || nameMatch || brandMatch;

    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const target = selectedCategory.toLowerCase();
      const catVal = typeof p.category === 'object' && p.category !== null 
        ? `${p.category.slug || ''} ${p.category.name || ''}` 
        : String(p.category || '');
      matchesCategory = catVal.toLowerCase().includes(target) || p.slug?.toLowerCase()?.includes(target) || p.brand?.toLowerCase()?.includes(target);
    }

    const price = p.salePrice || p.price || 0;
    const matchesPrice = price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    const priceA = a.salePrice || a.price || 0;
    const priceB = b.salePrice || b.price || 0;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return (b.ratings?.average || 5) - (a.ratings?.average || 5);
    return 0;
  });

  return (
    <div className="min-h-screen bg-white py-8 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* SHOP.CO Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Home</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-black font-semibold uppercase">Shop</span>
          {selectedCategory !== 'all' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-black font-bold uppercase">{selectedCategory}</span>
            </>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex justify-between items-center bg-[#F0F0F0] p-4 rounded-2xl">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-2 text-xs font-bold uppercase text-black cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-black" />
            <span>{showMobileFilter ? 'Hide Filters' : 'Filter Watch Collection'}</span>
          </button>
          <span className="text-xs text-slate-500 font-semibold">{filteredProducts.length} Items</span>
        </div>

        {/* SHOP.CO Grid Layout: Left Sidebar + Right Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SHOP.CO Left Filter Sidebar */}
          <aside className={`lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h3 className="font-bold text-lg text-black">Filters</h3>
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            </div>

            {/* Categories List */}
            <div className="space-y-3 pb-4 border-b border-slate-200 text-xs font-semibold text-slate-600">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'casual', label: 'Casual Watches' },
                { id: 'formal', label: 'Formal Luxury' },
                { id: 'party', label: 'Party Heritage' },
                { id: 'gym', label: 'Gym & Sport' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left py-1 flex justify-between items-center transition-colors ${
                    selectedCategory === c.id ? 'text-black font-extrabold' : 'hover:text-black'
                  }`}
                >
                  <span>{c.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>

            {/* Price Slider */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <div className="flex justify-between text-xs font-bold text-black">
                <span>Price</span>
                <span>Up to ${maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Colors Swatches */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <span className="font-bold text-xs text-black block">Colors</span>
              <div className="flex flex-wrap gap-2">
                {['#000000', '#00C49F', '#FF8042', '#FFBB28', '#0088FE', '#8884d8', '#E5E7EB'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check className="w-3 h-3 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Size / Strap Selectors */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <span className="font-bold text-xs text-black block">Size & Strap</span>
              <div className="flex flex-wrap gap-2">
                {['38mm', '40mm', '42mm', '44mm'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                    className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                      selectedSize === size ? 'bg-black text-white' : 'bg-[#F0F0F0] text-black hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Filter Button */}
            <button
              onClick={() => {}}
              className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-slate-800 transition-all shadow-md"
            >
              Apply Filter
            </button>
          </aside>

          {/* SHOP.CO Right Product Grid Container */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Header Title & Sorting Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tighter uppercase">
                  {selectedCategory === 'all' ? 'Casual' : selectedCategory}
                </h1>
                <p className="text-xs text-slate-500 font-medium">Showing 1-{filteredProducts.length} of {products.length} Products</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F0F0F0] text-black font-bold text-xs rounded-full px-4 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Cards Grid */}
            {loading ? (
              <div className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                Loading Products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-[#F0F0F0] rounded-3xl p-8 space-y-3">
                <p className="font-bold text-black text-base">No products match your criteria</p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('all'); setMaxPrice(10000); }}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id || product.slug}
                    variants={{
                      hidden: { opacity: 0, y: 25, rotateX: 6 },
                      show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.4 } },
                    }}
                    style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShopContent />
    </Suspense>
  );
}
