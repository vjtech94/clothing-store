export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface CartItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
}
