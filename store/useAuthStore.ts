import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  userProfile: any | null;
  setTokens: (token: string, refreshToken: string) => void;
  setUserProfile: (profile: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      userProfile: null,
      setTokens: (token, refreshToken) => set({ token, refreshToken, isAuthenticated: !!token }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      logout: () => set({ token: null, refreshToken: null, isAuthenticated: false, userProfile: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
