import { create } from 'zustand';
import api from '../lib/api';

interface WishlistState {
  wishlist: string[]; // array of product IDs or slugs
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

const getInitialWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('chronex_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (list: string[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('chronex_wishlist', JSON.stringify(list));
    } catch (e) {
      console.warn('Wishlist storage error:', e);
    }
  }
};

const hasRealToken = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('chronex_token');
  return !!token && token !== 'demo-jwt-token';
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: getInitialWishlist(),
  isLoading: false,

  fetchWishlist: async () => {
    if (!hasRealToken()) return;

    set({ isLoading: true });
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        const ids = (res.data.data || []).map((item: any) => item._id || item.slug || item);
        set({ wishlist: ids, isLoading: false });
        saveWishlist(ids);
      }
    } catch {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const current = get().wishlist;
    const exists = current.includes(productId);

    const updated = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    
    set({ wishlist: updated });
    saveWishlist(updated);

    if (hasRealToken()) {
      try {
        await api.post(`/wishlist/toggle/${productId}`);
      } catch (e) {
        console.warn('Wishlist sync note:', e);
      }
    }

    return !exists;
  },

  isInWishlist: (productId) => {
    return get().wishlist.includes(productId);
  },
}));
