import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUserProfile {
  id?: number;
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  phone_number?: string;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  userProfile: AuthUserProfile | null;
  hasHydrated: boolean;
  setTokens: (token: string, refreshToken: string) => void;
  setUserProfile: (profile: AuthUserProfile) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      userProfile: null,
      hasHydrated: false,
      setTokens: (token, refreshToken) => set({ token, refreshToken, isAuthenticated: !!token }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      logout: () => set({ token: null, refreshToken: null, isAuthenticated: false, userProfile: null }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
