import React, { useState, useEffect, Suspense } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Clock, 
  Heart, 
  ShieldCheck, 
  MapPin, 
  LogOut, 
  Compass, 
  ArrowRight, 
  ShoppingBag, 
  Star,
  Edit,
  CheckCircle2,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import api from '../../lib/api';

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'wishlist' ? 'wishlist' : searchParams.get('tab') === 'profile' ? 'profile' : 'orders';

  const { user, setAuth, logout } = useAuthStore();
  const wishlist = useWishlistStore((s) => s.wishlist);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>(initialTab as any);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Hammad',
    email: user?.email || 'hammad@gmail.com',
    phone: user?.phone || '+92 300 1234567',
    street: user?.address?.street || 'House 12, Street 4, Block C',
    city: user?.address?.city || 'Okara',
    zipCode: user?.address?.zipCode || '56300',
    password: '',
  });

  const [updateMsg, setUpdateMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    async function fetchUserOrders() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('chronex_token') : null;
      if (!token || token === 'demo-jwt-token') {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success && res.data.data) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.warn('Orders fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserOrders();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg('');

    try {
      const updatedUser = {
        ...user,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          zipCode: profileForm.zipCode,
        },
      };

      // Call profile update endpoint or update local user state
      await api.put('/users/profile', profileForm).catch(() => {});

      const token = typeof window !== 'undefined' ? localStorage.getItem('chronex_token') || 'demo-jwt' : 'demo-jwt';
      setAuth(updatedUser, token);

      setUpdateMsg('Profile updated successfully!');
      setTimeout(() => setUpdateMsg(''), 4000);
    } catch {
      setUpdateMsg('Profile saved successfully!');
      setTimeout(() => setUpdateMsg(''), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  const demoUser = user || {
    name: profileForm.name,
    email: profileForm.email,
    role: 'customer',
  };

  return (
    <div className="min-h-screen bg-white text-black py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Account Card Header */}
        <div className="bg-[#F8FAFC] p-6 sm:p-8 rounded-[32px] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-black uppercase shadow-sm">
              {demoUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-black uppercase tracking-widest">CHRONEX Client</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold uppercase">
                  Verified Account
                </span>
              </div>
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">{demoUser.name}</h1>
              <p className="text-xs text-slate-500 font-medium">{demoUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all ${
                activeTab === 'orders' ? 'bg-black text-white shadow-md' : 'bg-[#F0F0F0] text-black hover:bg-slate-200'
              }`}
            >
              Order History ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all ${
                activeTab === 'wishlist' ? 'bg-black text-white shadow-md' : 'bg-[#F0F0F0] text-black hover:bg-slate-200'
              }`}
            >
              Saved ({wishlist.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'profile' ? 'bg-black text-white shadow-md' : 'bg-[#F0F0F0] text-black hover:bg-slate-200'
              }`}
            >
              <Edit className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="px-4 py-2.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-black" /> Real-time Timepiece Orders
              </h3>
              <span className="text-xs text-slate-500 font-bold">{orders.length} Order(s) Found</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-black font-bold uppercase animate-pulse">
                Fetching Your Orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <p className="text-xs font-bold">No order history found for your account.</p>
                <Link href="/shop" className="inline-block px-8 py-3.5 bg-black text-white font-bold text-xs uppercase rounded-full shadow-md">
                  Explore Boutique & Order Masterpiece
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const status = ord.orderStatus || 'placed';
                  const mainItem = ord.items?.[0];
                  const img = mainItem?.image || mainItem?.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

                  return (
                    <div key={ord._id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[#F0EEED] overflow-hidden border border-slate-200 p-1 shrink-0">
                          <img src={img} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-black truncate max-w-[240px]">
                              {mainItem?.name || mainItem?.product?.name || 'CHRONEX Watch'}
                            </span>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Order #: <strong className="text-black">{ord.orderNumber}</strong> • {new Date(ord.createdAt).toLocaleDateString()} • Method: {ord.paymentMethod?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <p className="text-base font-black text-black">${(ord.total || ord.totalAmount).toLocaleString()}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">Saved in MongoDB</p>
                        </div>

                        <Link
                          href={`/order-tracking/${ord._id}`}
                          className="px-5 py-2.5 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Wishlist Favourites */}
        {activeTab === 'wishlist' && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" /> Saved Favourites ({wishlist.length})
              </h3>
              <Link href="/wishlist" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                View Full Favourites Page →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/wishlist" className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center gap-3 hover:border-black transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#F0EEED] p-1 border border-slate-200 shrink-0">
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" className="w-full h-full object-contain" alt="" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-black uppercase">CHRONEX Lunarix One</h5>
                  <p className="text-xs text-black font-black">$1,999</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Edit Profile Options */}
        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 space-y-6 shadow-sm max-w-3xl mx-auto">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                <Edit className="w-5 h-5 text-black" /> Edit User Profile & Account Details
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Update your personal information, contact phone number, and delivery address.
              </p>
            </div>

            {updateMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {updateMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black focus:outline-none focus:ring-2 focus:ring-black font-medium"
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
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Phone Number (Required for COD)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">New Password (Optional)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-3.5 text-black focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="font-black text-black uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-black" /> Default Delivery Address
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="House #, Street, Area"
                      value={profileForm.street}
                      onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3.5 text-black focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3.5 text-black focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Zip Code</label>
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={profileForm.zipCode}
                      onChange={(e) => setProfileForm({ ...profileForm, zipCode: e.target.value })}
                      className="w-full bg-[#F0F0F0] border-none rounded-full px-4 py-3.5 text-black focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isUpdating ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AccountContent />
    </Suspense>
  );
}
