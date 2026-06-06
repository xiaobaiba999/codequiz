import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setAuth: (data: { accessToken: string; refreshToken: string; user: any }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setToken: (token) => set({ token }),
      setAuth: (data) =>
        set({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
        }),
    }),
    { name: 'codequiz-auth' },
  ),
);
