import { AppTheme, useThemeStore } from '../../stores';

export const useScrollBar = (): string => {
  const { theme } = useThemeStore();
  return `scrollbar ${
    theme === AppTheme.DARK
      ? 'scrollbar-thumb-gray-900'
      : 'scrollbar-thumb-gray-300'
  }`;
};
