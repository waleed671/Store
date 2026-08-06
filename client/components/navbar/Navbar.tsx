import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  Compass, 
  Clock, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const { user, logout } = useAuthStore();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Collections', href: '/shop?collection=lunarix-one' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Story', href: '/#story' },
  ];

  const isAdminPage = pathname?.startsWith('/admin');

  // Completely hide storefront top navbar on all Admin routes (/admin/*)
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* SHOP.CO Top Announcement Banner */}
      {!isAdminPage && (
        <div className="bg-black text-white text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-between z-50 relative">
          <div className="flex-1 text-center">
            <span>Sign up and get 20% off to your first order. </span>
            <Link href="/auth/register" className="font-bold underline hover:text-slate-300 transition-colors ml-1">
              Sign Up Now
            </Link>
          </div>
        </div>
      )}

      {/* Main SHOP.CO Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled || isAdminPage ? 'bg-white/95 backdrop-blur-md py-3.5 border-b border-slate-200 shadow-sm' : 'bg-white py-4.5 border-b border-slate-100'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* SHOP.CO Bold Black Logo */}
          <Link to={isAdminPage ? '/admin/dashboard' : '/'} className="flex items-center gap-2 group shrink-0">
            <span className="font-black text-2xl tracking-tighter text-black uppercase flex items-center gap-0.5">
              CHRONEX<span className="text-black">.CO</span>
            </span>
            {isAdminPage && (
              <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-wider">
                ADMIN SUITE
              </span>
            )}
          </Link>

          {/* Desktop Navigation Links with Instant Hover Prefetch */}
          {!isAdminPage && (
            <nav className="hidden lg:flex items-center gap-6 shrink-0">
              <Link
                to="/shop"
                className="text-sm font-semibold text-slate-800 hover:text-black transition-colors flex items-center gap-1 uppercase"
              >
                Shop <ChevronDown className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/shop?sort=discount"
                className="text-sm font-semibold text-slate-800 hover:text-black transition-colors uppercase"
              >
                On Sale
              </Link>
              <Link
                to="/shop?sort=newest"
                className="text-sm font-semibold text-slate-800 hover:text-black transition-colors uppercase"
              >
                New Arrivals
              </Link>
              <Link
                to="/#brands"
                className="text-sm font-semibold text-slate-800 hover:text-black transition-colors uppercase"
              >
                Brands
              </Link>
            </nav>
          )}

          {/* Inline Search Bar (SHOP.CO Light Pill Style) */}
          {!isAdminPage && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F0F0F0] border-none rounded-full pl-11 pr-4 py-2.5 text-xs text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </form>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* View Storefront button for Admin */}
            {isAdminPage && (
              <Link
                to="/shop"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Boutique Store</span>
              </Link>
            )}

            {/* Storefront Action Icons (Search, Wishlist, Cart) */}
            {!isAdminPage && (
              <>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-slate-800 hover:text-black transition-all md:hidden"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist Button */}
                <Link
                  to="/wishlist"
                  className="p-2 text-slate-800 hover:text-red-500 transition-all relative"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Shopping Cart Drawer Trigger */}
                <button
                  onClick={toggleCart}
                  className="p-2 text-slate-800 hover:text-black transition-all relative group"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalCartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* User Account / Admin Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0F0F0] border border-slate-200 hover:bg-slate-200 transition-all text-black cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-black uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs text-black font-bold hidden lg:inline max-w-[90px] truncate uppercase tracking-tight">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-black" />
                </button>
              ) : (
                <Link
                  to="/auth/login"
                  className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-slate-800 transition-all shadow-md"
                >
                  <User className="w-3.5 h-3.5 text-white" />
                  Sign In
                </Link>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && user && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-black"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Signed in as</p>
                    <p className="text-xs font-bold text-black truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-black text-white text-[10px] rounded-full font-bold uppercase">
                        Admin Access
                      </span>
                    )}
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-black hover:bg-[#F8FAFC] transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-black" />
                      Admin Control Center
                    </Link>
                  )}

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-[#F8FAFC] font-semibold transition-colors"
                  >
                    <User className="w-4 h-4 text-black" />
                    My Account & Orders
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 font-bold hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-black hover:text-slate-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Overlay Mobile Search Bar */}
        {searchOpen && (
          <div className="bg-white border-b border-slate-200 py-3 px-4 shadow-xl animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search CHRONEX timepieces, Rolex, Hublot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#F0F0F0] text-black placeholder-slate-400 text-xs rounded-full px-4 py-2.5 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs text-black hover:text-slate-600 uppercase font-bold"
              >
                Close
              </button>
            </form>
          </div>
        )}

        {/* SHOP.CO Mobile Nav Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 pt-4 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-black hover:text-slate-600 py-2.5 border-b border-slate-100 uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <Link
                to="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 bg-black text-white text-xs font-bold uppercase rounded-full shadow-lg mt-4"
              >
                Sign In / Register
              </Link>
            ) : (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 bg-black text-white text-xs font-bold uppercase rounded-full shadow-lg mt-4"
              >
                My Profile & Orders
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
