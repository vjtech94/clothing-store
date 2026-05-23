import { create } from 'zustand';
import EncryptedStorage from 'react-native-encrypted-storage';
import { User, AuthResponse } from '../types/user';
import { authApi } from '../api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await authApi.login({ email, password });
    const { accessToken, refreshToken, user } = response.data.data;

    await EncryptedStorage.setItem('access_token', accessToken);
    await EncryptedStorage.setItem('refresh_token', refreshToken);

    set({ user, isAuthenticated: true });
  },

  signup: async (firstName, lastName, email, password) => {
    const response = await authApi.signup({
      firstName,
      lastName,
      email,
      password,
    });
    const { accessToken, refreshToken, user } = response.data.data;

    await EncryptedStorage.setItem('access_token', accessToken);
    await EncryptedStorage.setItem('refresh_token', refreshToken);

    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {}
    await EncryptedStorage.removeItem('access_token');
    await EncryptedStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await EncryptedStorage.getItem('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await authApi.getMe();
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
