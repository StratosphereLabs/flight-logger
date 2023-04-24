import { Button } from 'react-daisyui';
import { DarkModeIcon, LightModeIcon } from './Icons';
import { AppTheme, useThemeStore } from '../../stores';

export const DarkModeButton = (): JSX.Element => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <Button onClick={toggleTheme} color="ghost" shape="circle">
      {theme === AppTheme.DARK ? <LightModeIcon /> : <DarkModeIcon />}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};
