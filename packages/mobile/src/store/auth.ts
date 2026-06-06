import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setAuth: (data: { accessToken: string; refreshToken: string; user: any }) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  setToken: (token) => {
    AsyncStorage.setItem('token', token);
    set({ token });
  },
  setAuth: (data) => {
    AsyncStorage.multiSet([
      ['token', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
    set({ token: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  },
  logout: () => {
    AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
    set({ token: null, refreshToken: null, user: null });
  },
  loadFromStorage: async () => {
    const [token, refreshToken, userStr] = await AsyncStorage.multiGet(['token', 'refreshToken', 'user']);
    set({
      token: token[1],
      refreshToken: refreshToken[1],
      user: userStr[1] ? JSON.parse(userStr[1]) : null,
    });
  },
}));
