import { api } from './api';

export interface UserProfile {
  id?: number;
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  phone_number?: string;
  birth_date?: string;
  gender?: string;
  [key: string]: unknown;
}

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: { email: string; password: string; full_name: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async (token?: string) => {
    const response = await api.get('/users/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const profile = unwrapData<UserProfile>(response.data);
    return {
      ...profile,
      // Keep both naming styles to avoid breaking existing UI usage.
      phone: profile.phone || profile.phone_number || '',
      phone_number: profile.phone_number || profile.phone || '',
    } as UserProfile;
  },
  updateProfile: async (payload: { full_name?: string; phone?: string }) => {
    const response = await api.put('/users/profile', payload);
    return unwrapData<UserProfile>(response.data);
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      old_pass: oldPassword,
      new_pass: newPassword,
    });
    return response.data;
  },
};
