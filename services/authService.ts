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
}

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

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
    const profile = unwrapData<UserProfile>(response.data);
    return {
      ...profile,
      // Keep both naming styles to avoid breaking existing UI usage.
      phone: profile.phone || profile.phone_number || '',
      phone_number: profile.phone_number || profile.phone || '',
    } as UserProfile;
  }
};
