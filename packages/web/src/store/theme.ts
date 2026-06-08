import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'eyecare';

interface ThemeState {
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

const themeOrder: ThemeMode[] = ['light', 'dark', 'eyecare'];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setTheme: (mode) => set({ mode }),
      cycleTheme: () => {
        const { mode } = get();
        const idx = themeOrder.indexOf(mode);
        const next = themeOrder[(idx + 1) % themeOrder.length];
        set({ mode: next });
      },
    }),
    { name: 'codequiz-theme' },
  ),
);

// 向后兼容旧代码
export const useThemeStoreCompat = {
  get isDark() { return useThemeStore.getState().mode === 'dark'; },
  get toggleTheme() {
    return () => {
      const store = useThemeStore.getState();
      store.setTheme(store.mode === 'dark' ? 'light' : 'dark');
    };
  },
};
