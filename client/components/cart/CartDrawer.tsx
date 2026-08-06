import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    appliedCoupon, 
    discountAmount, 
    applyCoupon, 
    getSubtotal, 
    getTotal 
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const total = getTotal();
  const freeShippingThreshold = 500;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim());
    setCouponMsg({ text: res.message, success: res.success });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between text-black">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-lg font-black uppercase tracking-tighter text-black">YOUR CART</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold">
                {items.length}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Shopify Free shipping bar */}
          <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-slate-200 text-xs">
            <div className="flex justify-between items-center mb-1 text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4 text-black" />
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-600 font-black">Complimentary Express Shipping Unlocked!</span>
                ) : (
                  <span>Add <strong className="text-black">${(freeShippingThreshold - subtotal).toFixed(2)}</strong> for Free Shipping</span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-500 rounded-full" 
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-black text-base font-bold">Your cart is currently empty</p>
                <button
                  onClick={closeCart}
                  className="px-6 py-3 bg-black text-white font-bold text-xs uppercase rounded-full"
                >
                  Explore Luxury Collection
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.product.salePrice || item.product.price;
                const imageSrc = item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

                return (
                  <div key={`${item.product._id}-${item.selectedColor}-${item.selectedStrap}`} className="pt-4 flex gap-4 items-center">
                    <div className="w-20 h-20 bg-[#F0EEED] rounded-2xl overflow-hidden shrink-0 border border-slate-200 p-2">
                      <img src={imageSrc} alt={item.product.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-black text-black line-clamp-1">{item.product.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Finish: <span className="font-bold text-black uppercase">{item.selectedColor || 'Default'}</span>
                      </p>
                      <p className="text-sm font-black text-black">${itemPrice.toLocaleString()}</p>
                    </div>

                    {/* Quantity counter */}
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => removeItem(item.product._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-[#F0F0F0] rounded-full px-3 py-1 text-black text-xs font-bold">
                        <button onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-[#F8FAFC] space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. DISCOUNT20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs text-black uppercase focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button type="submit" className="px-5 py-2.5 bg-black text-white font-bold text-xs uppercase rounded-full">
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className={`text-xs font-bold ${couponMsg.success ? 'text-emerald-600' : 'text-red-600'}`}>
                  {couponMsg.text}
                </p>
              )}

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">${subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({appliedCoupon})</span>
                    <span className="font-bold">-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-bold text-emerald-600">Free Express</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-black">
                  <span>Total Amount</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              {/* SHOP.CO Checkout Button */}
              <button
                onClick={() => { closeCart(); navigate('/checkout'); }}
                className="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-slate-500 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Cash on Delivery (COD) & Instant Confirmation Available
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
