import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import api from '../lib/api';

/**
 * AuthProvider: on first client mount, reads the token from localStorage
 * and fetches the real user profile from the backend.
 * This ensures 401 errors don't happen after a page refresh.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('chronex_token') : null;

    // Skip demo tokens
    if (!storedToken || storedToken === 'demo-jwt-token') return;

    // If we have a real token but no user in memory (e.g. after page refresh), re-fetch
    if (storedToken && !user) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data.success && res.data.user) {
            setAuth(res.data.user, storedToken);
            useCartStore.getState().fetchCart();
          }
        })
        .catch(() => {
          // Token expired or invalid — clear it
          logout();
        });
    }
  }, []); // runs once on mount

  return <>{children}</>;
}
