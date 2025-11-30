import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export enum AppTheme {
  ABYSS = 'abyss',
  CORPORATE = 'corporate',
  CHRISTMAS = 'christmas',
  CYBERPUNK = 'cyberpunk',
  EMERALD = 'emerald',
  FANTASY = 'fantasy',
  FOREST = 'forest',
  NIGHT = 'night',
  SYNTHWAVE = 'synthwave',
  HALLOWEEN = 'halloween',
}

export const DARK_MODE_THEMES = [
  AppTheme.NIGHT,
  AppTheme.FOREST,
  AppTheme.SYNTHWAVE,
  AppTheme.ABYSS,
  AppTheme.HALLOWEEN,
  AppTheme.CHRISTMAS,
];

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? AppTheme.CHRISTMAS
        : AppTheme.CORPORATE,
      setTheme: (theme: AppTheme) => {
        set({ theme });
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
