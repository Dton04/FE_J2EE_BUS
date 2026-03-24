import { api } from './api';

export type LoginCredentials = { email: string; password: string };
export type RegisterData = { full_name: string; email: string; password: string };
export type AuthResponse = { access_token?: string; refresh_token?: string; [key: string]: unknown };

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
  getProfile: async (): Promise<Record<string, unknown>> => {
    const response = await api.get<Record<string, unknown>>('/users/profile');
    return response.data;
  }
};
