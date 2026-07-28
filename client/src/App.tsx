import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes as RouterRoutes, Route as RouterRoute, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import AuthProvider from '../components/AuthProvider';
import PageLoader from '../components/PageLoader';

// Pages
import HomeClient from '../app/HomeClient';
import ShopPage from '../app/shop/page';
import ProductDetailPage from '../app/product/[slug]/page';
import CheckoutPage from '../app/checkout/page';
import OrderTrackingPage from '../app/order-tracking/[id]/page';
import AccountPage from '../app/account/page';
import WishlistPage from '../app/wishlist/page';
import LoginPage from '../app/auth/login/page';
import RegisterPage from '../app/auth/register/page';
import AdminDashboardPage from '../app/admin/dashboard/page';

// 3D Animated Page & Component Transition Wrapper
function AnimatedPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <RouterRoutes location={location} key={location.pathname}>
        <RouterRoute path="/" element={<AnimatedPageWrapper><HomeClient /></AnimatedPageWrapper>} />
        <RouterRoute path="/shop" element={<AnimatedPageWrapper><ShopPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/product/:slug" element={<AnimatedPageWrapper><ProductDetailPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/checkout" element={<AnimatedPageWrapper><CheckoutPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/order-tracking/:id" element={<AnimatedPageWrapper><OrderTrackingPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/account" element={<AnimatedPageWrapper><AccountPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/wishlist" element={<AnimatedPageWrapper><WishlistPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/auth/login" element={<AnimatedPageWrapper><LoginPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/auth/register" element={<AnimatedPageWrapper><RegisterPage /></AnimatedPageWrapper>} />
        <RouterRoute path="/admin/dashboard" element={<AnimatedPageWrapper><AdminDashboardPage /></AnimatedPageWrapper>} />
        <RouterRoute path="*" element={<AnimatedPageWrapper><HomeClient /></AnimatedPageWrapper>} />
      </RouterRoutes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <Navbar />
        <main className="w-full">
          <AnimatedRoutes />
        </main>
        <CartDrawer />
        <Footer />
      </AuthProvider>
    </Router>
  );
}
