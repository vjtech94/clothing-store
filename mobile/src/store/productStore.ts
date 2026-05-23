import { create } from 'zustand';
import { Product, Category, ProductFilter, PagedResult } from '../types/product';
import { productApi } from '../api/productApi';

interface ProductState {
  products: Product[];
  categories: Category[];
  currentProduct: Product | null;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  fetchProducts: (filter?: ProductFilter) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  loadMore: (filter?: ProductFilter) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  currentProduct: null,
  isLoading: false,
  totalPages: 0,
  currentPage: 0,

  fetchProducts: async (filter) => {
    set({ isLoading: true });
    try {
      const response = await productApi.getProducts({ ...filter, page: 0 });
      const data = response.data.data;
      set({
        products: data.content,
        totalPages: data.totalPages,
        currentPage: 0,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await productApi.getProductById(id);
      set({ currentProduct: response.data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  searchProducts: async (query) => {
    set({ isLoading: true });
    try {
      const response = await productApi.searchProducts(query);
      set({ products: response.data.data.content, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await productApi.getCategories();
      set({ categories: response.data.data });
    } catch {}
  },

  loadMore: async (filter) => {
    const { currentPage, totalPages, products } = get();
    if (currentPage >= totalPages - 1) return;

    const nextPage = currentPage + 1;
    const response = await productApi.getProducts({ ...filter, page: nextPage });
    const data = response.data.data;
    set({
      products: [...products, ...data.content],
      currentPage: nextPage,
    });
  },
}));
