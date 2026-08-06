import React, { useState, Suspense } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../lib/api';

function LoginContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawRedirectTarget = searchParams.get('redirect') || '/account';
  const msgParam = searchParams.get('msg');

  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const user = res.data.user;
        const token = res.data.token;
        setAuth(user, token);

        // Role-Based Access Control (RBAC) & Redirect Target Logic
        let target = rawRedirectTarget || '/account';
        if (user.role === 'admin') {
          target = target === '/account' ? '/admin/dashboard' : target;
        } else {
          // If customer tries to access admin dashboard, redirect to checkout/account
          target = target.includes('/admin') ? '/checkout' : target;
        }

          navigate(target);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please check your credentials.';
      setError(msg);
      setLoading(false);
    }
  };

  const formatMessage = (msg: string | null) => {
    if (!msg) return null;
    if (msg === 'login_required') return 'Please sign in to proceed with your checkout.';
    if (msg === 'admin_required') return 'Admin authentication required to access Admin Dashboard.';
    return msg;
  };

  const userFriendlyMsg = formatMessage(msgParam);

  return (
    <div className="min-h-[85vh] bg-[#F2F0F1] py-12 flex items-center justify-center px-4 text-black">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[32px] border border-slate-200 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="font-black text-3xl tracking-tighter text-black uppercase inline-block">
            CHRONEX<span className="text-black">.CO</span>
          </Link>
          <p className="text-xs text-slate-500 font-medium">Sign in to your luxury account</p>
        </div>

        {userFriendlyMsg && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-2xl text-center">
            {userFriendlyMsg}
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-2xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••••••"
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
            {loading ? 'Authenticating...' : 'Sign In & Continue'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link href="/auth/register" className="font-bold text-black hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F0F1]" />}>
      <LoginContent />
    </Suspense>
  );
}
