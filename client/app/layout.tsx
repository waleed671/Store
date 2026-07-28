import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import AuthProvider from '../components/AuthProvider';
import PageLoader from '../components/PageLoader';

export const metadata: Metadata = {
  title: 'CHRONEX LUNARIX | Luxury Space Horology & Timepieces',
  description: 'Experience CHRONEX Lunarix One. Engineered with Grade 5 Titanium, Sapphire Crystal, and manufacture mechanical tourbillon movements.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-white text-slate-900 antialiased selection:bg-black selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <CartDrawer />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
