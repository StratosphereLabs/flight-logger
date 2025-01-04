import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export enum AppTheme {
  BUSINESS = 'business',
  CYBERPUNK = 'cyberpunk',
  DARK = 'dark',
  EMERALD = 'emerald',
  LIGHT = 'light',
  LOFI = 'lofi',
  NIGHT = 'night',
  NORD = 'nord',
  SUNSET = 'sunset',
  WINTER = 'winter',
}

export const DARK_MODE_THEMES = [
  AppTheme.DARK,
  AppTheme.NIGHT,
  AppTheme.SUNSET,
];

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

export const useIsDarkMode = (): boolean => {
  const { theme } = useThemeStore();
  return DARK_MODE_THEMES.includes(theme);
};

useThemeStore.subscribe(({ theme }) => {
  document.getElementsByTagName('html')[0].setAttribute('data-theme', theme);
});
