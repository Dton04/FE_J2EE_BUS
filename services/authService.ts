import { api } from './api';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async (token?: string) => {
    const response = await api.get('/users/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  }
};
