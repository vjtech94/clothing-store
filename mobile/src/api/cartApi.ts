import apiClient from './apiClient';
import { Cart, CartItemRequest } from '../types/cart';

export const cartApi = {
  getCart: () =>
    apiClient.get<{ data: Cart }>('/api/cart'),

  addItem: (item: CartItemRequest) =>
    apiClient.post<{ data: Cart }>('/api/cart/items', item),

  updateQuantity: (itemId: string, quantity: number) =>
    apiClient.put<{ data: Cart }>(`/api/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    apiClient.delete<{ data: Cart }>(`/api/cart/items/${itemId}`),

  clearCart: () =>
    apiClient.delete('/api/cart'),
};
