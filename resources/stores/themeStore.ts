import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export enum AppTheme {
  BUSINESS = 'business',
  CYBERPUNK = 'cyberpunk',
  DARK = 'dark',
  EMERALD = 'emerald',
  LIGHT = 'light',
  NORD = 'nord',
  SUNSET = 'sunset',
  WINTER = 'winter',
}

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? AppTheme.DARK
        : AppTheme.LIGHT,
      setTheme: (theme: AppTheme) => {
        set({ theme });
      },
      toggleTheme: () => {
        set({
          theme: get().theme === AppTheme.DARK ? AppTheme.LIGHT : AppTheme.DARK,
        });
      },
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
