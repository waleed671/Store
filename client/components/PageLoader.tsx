'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When path or query changes, flash short loading bar then finish
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-1 bg-slate-900 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 animate-pulse w-full transform -translate-x-full transition-transform duration-300 ease-out"
           style={{ animation: 'progress-bar 0.8s ease-in-out infinite' }} />
      <style jsx>{`
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-20%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
