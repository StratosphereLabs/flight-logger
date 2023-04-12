import { Button } from 'react-daisyui';
import { DarkModeIcon, LightModeIcon } from './Icons';
import { AppTheme, useAppContext } from '../../providers';

export const DarkModeButton = (): JSX.Element => {
  const { theme, setTheme } = useAppContext();
  const toggleTheme = (): void =>
    setTheme(oldTheme =>
      oldTheme === AppTheme.DARK ? AppTheme.LIGHT : AppTheme.DARK,
    );
  return (
    <Button
      aria-label="Toggle Theme"
      onClick={toggleTheme}
      color="ghost"
      shape="circle"
    >
      {theme === AppTheme.DARK ? <LightModeIcon /> : <DarkModeIcon />}
    </Button>
  );
};
