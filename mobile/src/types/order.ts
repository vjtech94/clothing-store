import { PagedResult } from './product';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
}

export interface CheckoutRequest {
  shippingAddress: ShippingAddress;
  items: {
    productId: string;
    variantId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    imageUrl: string;
  }[];
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export { PagedResult };
