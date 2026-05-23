import apiClient from './apiClient';
import { LoginRequest, SignupRequest, AuthResponse } from '../types/user';

export const authApi = {
  signup: (data: SignupRequest) =>
    apiClient.post<{ data: AuthResponse }>('/api/auth/signup', data),

  login: (data: LoginRequest) =>
    apiClient.post<{ data: AuthResponse }>('/api/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<{ data: AuthResponse }>('/api/auth/refresh', { refreshToken }),

  getMe: () =>
    apiClient.get<{ data: AuthResponse['user'] }>('/api/auth/me'),

  logout: () =>
    apiClient.post('/api/auth/logout'),
};
