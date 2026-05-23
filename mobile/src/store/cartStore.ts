import { create } from 'zustand';
import { Cart, CartItem, CartItemRequest } from '../types/cart';
import { cartApi } from '../api/cartApi';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItemRequest) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartApi.getCart();
      set({ cart: response.data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    const response = await cartApi.addItem(item);
    set({ cart: response.data.data });
  },

  updateQuantity: async (itemId, quantity) => {
    const response = await cartApi.updateQuantity(itemId, quantity);
    set({ cart: response.data.data });
  },

  removeItem: async (itemId) => {
    const response = await cartApi.removeItem(itemId);
    set({ cart: response.data.data });
  },

  clearCart: async () => {
    await cartApi.clearCart();
    set({ cart: null });
  },
}));
