import apiClient from './apiClient';
import { Product, Category, ProductFilter, PagedResult } from '../types/product';

export const productApi = {
  getProducts: (params?: ProductFilter) =>
    apiClient.get<{ data: PagedResult<Product> }>('/api/products', { params }),

  getProductById: (id: string) =>
    apiClient.get<{ data: Product }>(`/api/products/${id}`),

  searchProducts: (query: string, page = 0) =>
    apiClient.get<{ data: PagedResult<Product> }>('/api/products/search', {
      params: { q: query, page },
    }),

  getCategories: () =>
    apiClient.get<{ data: Category[] }>('/api/categories'),

  getProductsByCategory: (categoryId: string, page = 0) =>
    apiClient.get<{ data: PagedResult<Product> }>(
      `/api/categories/${categoryId}/products`,
      { params: { page } },
    ),
};
