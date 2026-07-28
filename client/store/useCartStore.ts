import { create } from 'zustand';
import api from '../lib/api';

export interface CartItem {
  _id?: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    salePrice?: number;
    images: string[];
    slug: string;
    sku: string;
    stock: number;
  };
  quantity: number;
  selectedColor?: string;
  selectedStrap?: string;
  priceAtAddition: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  appliedCoupon: string | null;
  discountAmount: number;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: any, quantity?: number, selectedColor?: string, selectedStrap?: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

const STORAGE_KEY = 'chronex_cart_items';

const getInitialCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart storage error:', e);
    }
  }
};

const hasRealToken = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('chronex_token');
  return !!token && token !== 'demo-jwt-token';
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialCart(),
  isOpen: false,
  isLoading: false,
  appliedCoupon: null,
  discountAmount: 0,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  fetchCart: async () => {
    const localItems = getInitialCart();
    set({ isLoading: true });

    if (!hasRealToken()) {
      set({ items: localItems, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/cart');
      if (res.data.success && res.data.data) {
        const serverItems: CartItem[] = res.data.data.items || [];
        
        // Merge local guest items with server items so no items are lost on login!
        if (localItems.length > 0) {
          const merged = [...serverItems];
          for (const local of localItems) {
            const idx = merged.findIndex(
              (s) => (s.product._id || s.product) === (local.product._id || local.product)
            );
            if (idx === -1) {
              merged.push(local);
              // Post to server cart in background
              api.post('/cart/items', {
                productId: local.product._id || local.product,
                quantity: local.quantity,
                selectedColor: local.selectedColor,
                selectedStrap: local.selectedStrap,
              }).catch(() => {});
            }
          }
          set({ items: merged, isLoading: false });
          saveCartToStorage(merged);
        } else {
          set({ items: serverItems, isLoading: false });
          saveCartToStorage(serverItems);
        }
      } else {
        set({ items: localItems, isLoading: false });
      }
    } catch {
      set({ items: localItems, isLoading: false });
    }
  },

  addItem: async (product, quantity = 1, selectedColor, selectedStrap) => {
    const maxStock = typeof product.stock === 'number' ? product.stock : 99;
    const current = get().items;
    const prodId = product._id || product.id || product.slug;

    const existingIndex = current.findIndex(
      (item) => (item.product._id || item.product.slug) === prodId && item.selectedColor === selectedColor
    );
    let updatedItems = [...current];

    if (existingIndex > -1) {
      const currentQty = updatedItems[existingIndex].quantity;
      updatedItems[existingIndex].quantity = Math.min(currentQty + quantity, maxStock);
    } else {
      updatedItems.push({
        product: {
          _id: prodId,
          name: product.name,
          brand: product.brand || 'CHRONEX',
          price: product.price,
          salePrice: product.salePrice,
          images: product.images || [],
          slug: product.slug || prodId,
          sku: product.sku || 'CHX-WATCH',
          stock: maxStock,
        },
        quantity: Math.min(quantity, maxStock),
        selectedColor,
        selectedStrap,
        priceAtAddition: product.salePrice || product.price,
      });
    }

    set({ items: updatedItems, isOpen: true });
    saveCartToStorage(updatedItems);

    // Sync backend if logged in
    if (hasRealToken()) {
      try {
        await api.post('/cart/items', {
          productId: prodId,
          quantity,
          selectedColor,
          selectedStrap,
        });
      } catch (e) {
        console.warn('Backend cart sync note:', e);
      }
    }
  },

  removeItem: async (productId) => {
    const updated = get().items.filter((item) => (item.product._id || item.product.slug) !== productId);
    set({ items: updated });
    saveCartToStorage(updated);

    if (hasRealToken()) {
      try {
        await api.delete(`/cart/items/${productId}`);
      } catch (e) {
        console.warn(e);
      }
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) return get().removeItem(productId);

    const targetItem = get().items.find((item) => (item.product._id || item.product.slug) === productId);
    const maxStock = typeof targetItem?.product?.stock === 'number' ? targetItem.product.stock : 99;
    const finalQty = Math.min(quantity, maxStock);

    const updated = get().items.map((item) =>
      (item.product._id || item.product.slug) === productId ? { ...item, quantity: finalQty } : item
    );
    set({ items: updated });
    saveCartToStorage(updated);

    if (hasRealToken()) {
      try {
        await api.put(`/cart/items/${productId}`, { quantity: finalQty });
      } catch (e) {
        console.warn(e);
      }
    }
  },

  applyCoupon: async (code) => {
    try {
      const subtotal = get().getSubtotal();
      const res = await api.post('/coupons/validate', { code, orderValue: subtotal });
      if (res.data.success) {
        set({ appliedCoupon: code, discountAmount: res.data.discountAmount });
        return { success: true, message: `Coupon applied: saved $${res.data.discountAmount}!` };
      }
      return { success: false, message: res.data.message || 'Invalid coupon' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Error validating coupon' };
    }
  },

  clearCart: () => {
    set({ items: [], appliedCoupon: null, discountAmount: 0 });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price || item.priceAtAddition || 0;
      return total + price * item.quantity;
    }, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discountAmount;
    return Math.max(0, subtotal - discount);
  },
}));
