import { create } from 'zustand';
import api from '../lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'manager';
  avatar?: string;
  phone?: string;
  addresses?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('chronex_token') : null,
  isLoading: false,
  error: null,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chronex_token', token);
    }
    set({ user, token, error: null });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chronex_token');
    }
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        set({ user: res.data.user, isLoading: false });
      }
    } catch (err: any) {
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
