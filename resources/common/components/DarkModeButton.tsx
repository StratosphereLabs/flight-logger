import { Button } from 'react-daisyui';
import { AppTheme, useAppContext } from '../../context';
import { DarkModeIcon, LightModeIcon } from './Icons';

export const DarkModeButton = (): JSX.Element => {
  const { theme, setTheme } = useAppContext();
  const toggleTheme = (): void =>
    setTheme(oldTheme =>
      oldTheme === AppTheme.DARK ? AppTheme.LIGHT : AppTheme.DARK,
    );
  return (
    <Button
      onClick={toggleTheme}
      color="ghost"
      className="rounded-lg text-sm p-2.5"
    >
      {theme === AppTheme.DARK ? <LightModeIcon /> : <DarkModeIcon />}
    </Button>
  );
};
