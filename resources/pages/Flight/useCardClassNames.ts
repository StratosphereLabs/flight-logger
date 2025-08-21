import classNames from 'classnames';

import { useIsDarkMode } from '../../stores';

export const useCardClassNames = (): string => {
  const isDarkMode = useIsDarkMode();
  return classNames(
    'rounded-box p-3 shadow-md',
    isDarkMode ? 'bg-base-100/50' : 'bg-base-100/40',
  );
};
