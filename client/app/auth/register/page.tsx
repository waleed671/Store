'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Phone } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../lib/api';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (redirectTarget) {
      router.prefetch(redirectTarget);
      router.prefetch('/checkout');
      router.prefetch('/account');
    }
  }, [redirectTarget, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      if (res.data.success) {
        setAuth(res.data.user, res.data.token);
        if (typeof window !== 'undefined') {
          window.location.href = redirectTarget;
        } else {
          router.push(redirectTarget);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Email may already be in use.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F2F0F1] py-12 flex items-center justify-center px-4 text-black">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[32px] border border-slate-200 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="font-black text-3xl tracking-tighter text-black uppercase inline-block">
            CHRONEX<span className="text-black">.CO</span>
          </Link>
          <p className="text-xs text-slate-500 font-medium">Create your luxury account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                placeholder="John Carter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Phone Number (COD Verification)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="tel"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link href="/auth/login" className="font-bold text-black hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F0F1]" />}>
      <RegisterContent />
    </Suspense>
  );
}
