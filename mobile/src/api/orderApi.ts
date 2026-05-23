import apiClient from './apiClient';
import { Order, CheckoutRequest, PaymentIntentResponse, PagedResult } from '../types/order';

export const orderApi = {
  checkout: (data: CheckoutRequest) =>
    apiClient.post<{ data: PaymentIntentResponse }>('/api/orders/checkout', data),

  confirmPayment: (orderId: string, paymentIntentId: string) =>
    apiClient.post<{ data: Order }>('/api/orders/confirm', {
      orderId,
      paymentIntentId,
    }),

  getOrders: (page = 0) =>
    apiClient.get<{ data: PagedResult<Order> }>('/api/orders', {
      params: { page },
    }),

  getOrderById: (id: string) =>
    apiClient.get<{ data: Order }>(`/api/orders/${id}`),
};
