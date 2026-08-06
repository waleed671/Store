import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Lock, 
  ShoppingBag, 
  ArrowRight,
  Compass,
  ChevronRight
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, appliedCoupon, discountAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Address State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('chronex_token') : null;
    if (!token) {
      router.push('/auth/login?redirect=/checkout&msg=login_required');
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const subtotal = getSubtotal();
  const total = getTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product: item.product._id || item.product.slug || item.product,
          name: item.product.name,
          image: item.product.images?.[0],
          price: item.product.salePrice || item.product.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedStrap: item.selectedStrap,
        })),
        shippingAddress: {
          fullName: formData.fullName || user?.name || 'Valued Client',
          phone: formData.phone || user?.phone || '0000000000',
          line1: formData.street || 'N/A',
          city: formData.city || 'Okara',
          state: formData.state || formData.city || 'Punjab',
          pincode: formData.zipCode || '56300',
          country: formData.country || 'Pakistan',
        },
        email: formData.email,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Stripe',
        subtotal,
        discountAmount,
        couponCode: appliedCoupon,
        shippingPrice: 0,
        totalAmount: total,
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success && res.data.data) {
        setCompletedOrder(res.data.data);
        clearCart();
      } else {
        setErrorMsg('Could not place order. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error processing order into database';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    const orderId = completedOrder._id || completedOrder.orderNumber;
    return (
      <div className="min-h-[85vh] bg-[#F2F0F1] py-16 flex items-center justify-center px-4 text-black">
        <div className="max-w-md w-full bg-white p-8 rounded-[32px] border border-slate-200 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Order Confirmed</span>
            <h2 className="text-2xl font-black text-black uppercase">THANK YOU FOR YOUR ORDER</h2>
            <p className="text-xs text-slate-600">
              Your order <strong className="text-black">{completedOrder.orderNumber}</strong> has been confirmed and dispatches shortly.
            </p>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Payment Type:</span>
              <span className="text-black font-bold uppercase">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Total Amount:</span>
              <span className="text-black font-black">${(completedOrder.total || completedOrder.totalAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Address:</span>
              <span className="text-black font-bold truncate max-w-[200px]">{completedOrder.shippingAddress?.street}, {completedOrder.shippingAddress?.city}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/order-tracking/${orderId}`}
              className="block w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" /> Track Order Live
            </Link>

            <Link
              href="/account"
              className="block w-full py-3 bg-[#F0F0F0] text-black hover:bg-slate-200 text-xs font-bold uppercase tracking-widest rounded-full"
            >
              View Order History in Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SHOP.CO Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-black font-bold uppercase">Checkout</span>
        </div>

        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter">ORDER CHECKOUT</h1>
          <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure 256-Bit Encrypted Order Confirmation
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-slate-500 font-bold">Your shopping cart is empty.</p>
            <Link href="/shop" className="px-8 py-3.5 bg-black text-white font-bold text-xs uppercase rounded-full">
              Return to Boutique
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column - Delivery & Payment Form */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-black" /> 1. Delivery & Shipping Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Hassan Raza"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase">Phone Number (COD Required) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-500 font-bold uppercase">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="hassan@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-500 font-bold uppercase">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      placeholder="House #, Street Name, Area"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Karachi / Lahore / Islamabad"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase">Postal / Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="75500"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Option Selector */}
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-black" /> 2. Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-black bg-[#F8FAFC] text-black shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase">Cash on Delivery (COD)</span>
                      <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'cod' ? 'text-black' : 'text-slate-300'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500">Pay cash directly to courier rider upon parcel delivery.</p>
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-black bg-[#F8FAFC] text-black shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" /> Credit / Debit Card
                      </span>
                      <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-black' : 'text-slate-300'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500">Pay securely using Visa, MasterCard, or American Express.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Order Summary Box */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 space-y-6 shadow-sm sticky top-24">
                <h3 className="text-sm font-black text-black uppercase tracking-wider border-b border-slate-200 pb-3 flex justify-between items-center">
                  <span>Order Summary</span>
                  <span className="text-xs text-slate-400">({items.length} items)</span>
                </h3>

                {/* Items Preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex gap-3 text-xs items-center">
                      <div className="w-12 h-12 rounded-xl bg-[#F0EEED] p-1 border border-slate-200 shrink-0">
                        <img src={item.product.images?.[0]} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-black truncate">{item.product.name}</h5>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} • {item.selectedColor || 'Standard'}</p>
                      </div>
                      <span className="font-black text-black">${((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-xs border-t border-slate-200 pt-4 font-medium text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-bold">${subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-600 font-bold">Free Express</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-black border-t border-slate-200 pt-3">
                    <span>Total Amount</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* SHOP.CO Solid Black Place Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Dispatching Order...</span>
                  ) : (
                    <>
                      <span>Complete Order ({paymentMethod.toUpperCase()})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
