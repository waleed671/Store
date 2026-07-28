'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  MapPin, 
  ChevronLeft, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '../../../lib/api';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success && res.data.data) {
        setOrder(res.data.data);
      } else if (isInitial) {
        setError('Order not found.');
      }
    } catch (err: any) {
      if (isInitial) {
        setError(err.response?.data?.message || 'Error loading order tracking details');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    // Initial fetch with spinner
    fetchOrderDetails(true);

    // Live Real-Time Polling every 3 seconds using useState & useEffect
    const pollInterval = setInterval(() => {
      fetchOrderDetails(false);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20 flex items-center justify-center text-black text-xs font-bold uppercase tracking-widest animate-pulse">
        Loading Real-Time Order Status...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F2F0F1] py-20 flex items-center justify-center px-4 text-black">
        <div className="max-w-md w-full bg-white p-8 rounded-[32px] border border-red-200 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black uppercase text-black">Order Not Found</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link href="/account" className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full">
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = (order.orderStatus || order.status || 'placed').toLowerCase();
  const steps = [
    { id: 'placed', label: 'Order Placed', desc: 'Order saved in database', icon: Clock },
    { id: 'processing', label: 'Processing & Inspection', desc: 'Quality assurance check', icon: Package },
    { id: 'shipped', label: 'Shipped & In Transit', desc: 'Handed to express courier', icon: Truck },
    { id: 'delivered', label: 'Delivered', desc: 'Cash collected & signed', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['placed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-white text-black py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-black transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Account Dashboard
        </Link>

        {/* Order Header Box */}
        <div className="bg-[#F8FAFC] p-8 rounded-[32px] border border-slate-200 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Order Reference</span>
              <h1 className="text-2xl font-black text-black tracking-tight">{order.orderNumber}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Live Status Badge */}
              <span className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider animate-pulse">
                STATUS: {currentStatus}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold uppercase">
                {order.paymentMethod || 'COD'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600 pt-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Placed On</span>
              <span className="text-black font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
              <span className="text-black font-black">${(order.total || order.totalAmount).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery City</span>
              <span className="text-black font-bold">{order.shippingAddress?.city || 'Pakistan'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Recipient</span>
              <span className="text-black font-bold truncate block">{order.shippingAddress?.fullName || 'Client'}</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Timeline */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-black" /> Live Order Tracking Timeline
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Status Syncing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((st) => {
              const status = getStepStatus(st.id);
              const Icon = st.icon;

              return (
                <div key={st.id} className="flex flex-col items-center text-center space-y-3 relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    status === 'completed'
                      ? 'bg-emerald-500 text-white shadow-md scale-105'
                      : status === 'current'
                      ? 'bg-black text-white ring-4 ring-slate-200 shadow-lg scale-110'
                      : 'bg-[#F0F0F0] text-slate-400 border border-slate-200'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-black uppercase transition-colors ${
                      status === 'current' ? 'text-black font-black' : status === 'completed' ? 'text-emerald-600 font-bold' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items & Shipping Address Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Items */}
          <div className="lg:col-span-7 bg-white p-6 rounded-[32px] border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-black uppercase tracking-wider border-b border-slate-200 pb-3">
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 text-xs">
                  <div className="w-14 h-14 bg-[#F0EEED] rounded-xl overflow-hidden shrink-0 border border-slate-200 p-1">
                    <img src={item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-black text-black">{item.name || item.product?.name}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} • ${item.price?.toLocaleString()}</p>
                  </div>
                  <span className="font-black text-black">${((item.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-black uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-black" /> Shipping Destination
            </h3>
            <div className="text-xs text-slate-600 space-y-2 font-medium">
              <p><strong className="text-black">Recipient:</strong> {order.shippingAddress?.fullName || 'Client'}</p>
              <p><strong className="text-black">Contact:</strong> {order.shippingAddress?.phone || 'N/A'}</p>
              <p><strong className="text-black">Address:</strong> {order.shippingAddress?.line1 || order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p><strong className="text-black">Postal Code:</strong> {order.shippingAddress?.pincode || order.shippingAddress?.zipCode || '56300'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
