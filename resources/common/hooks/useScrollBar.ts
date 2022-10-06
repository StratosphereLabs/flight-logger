import { AppTheme, useAppContext } from '../../context';

export const useScrollBar = (): string => {
  const { theme } = useAppContext();
  return `scrollbar ${
    theme === AppTheme.DARK
      ? 'scrollbar-thumb-gray-900'
      : 'scrollbar-thumb-gray-300'
  }`;
};
