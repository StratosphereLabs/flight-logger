import { DropdownMenu } from 'stratosphere-ui';
import { CyberpunkIcon, DarkModeIcon, LightModeIcon, ThemeIcon } from './Icons';
import { AppTheme, useThemeStore } from '../../stores';

export const ThemeButton = (): JSX.Element => {
  const { setTheme } = useThemeStore();
  return (
    <DropdownMenu
      buttonProps={{
        color: 'ghost',
        shape: 'circle',
        children: (
          <>
            <ThemeIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Theme</span>
          </>
        ),
      }}
      items={[
        {
          id: 'light',
          onClick: () => setTheme(AppTheme.LIGHT),
          children: (
            <>
              <LightModeIcon />
              Light
            </>
          ),
        },
        {
          id: 'dark',
          onClick: () => setTheme(AppTheme.DARK),
          children: (
            <>
              <DarkModeIcon />
              Dark
            </>
          ),
        },
        {
          id: 'cyberpunk',
          onClick: () => setTheme(AppTheme.CYBERPUNK),
          children: (
            <>
              <CyberpunkIcon className="h-5 w-5" />
              Cyberpunk
            </>
          ),
        },
      ]}
      menuClassName="rounded-box p-2 right-0"
    />
  );
};
