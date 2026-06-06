import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => {
    const newDark = !state.isDark;
    AsyncStorage.setItem('isDark', String(newDark));
    return { isDark: newDark };
  }),
  loadTheme: async () => {
    const val = await AsyncStorage.getItem('isDark');
    set({ isDark: val === 'true' });
  },
}));
