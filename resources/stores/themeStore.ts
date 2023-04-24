import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export enum AppTheme {
  DARK = 'dark',
  LIGHT = 'light',
}

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: AppTheme.LIGHT,
      setTheme: (theme: AppTheme) => set({ theme }),
      toggleTheme: () =>
        set({
          theme: get().theme === AppTheme.DARK ? AppTheme.LIGHT : AppTheme.DARK,
        }),
    }),
    {
      name: 'flight-logger-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => state => {
        if (state !== undefined)
          document
            .getElementsByTagName('html')[0]
            .setAttribute('data-theme', state.theme);
      },
    },
  ),
);

useThemeStore.subscribe(({ theme }) => {
  document.getElementsByTagName('html')[0].setAttribute('data-theme', theme);
});
