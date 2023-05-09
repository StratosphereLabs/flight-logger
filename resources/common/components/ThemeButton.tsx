import { DropdownMenu } from 'stratosphere-ui';
import {
  BusinessIcon,
  CyberpunkIcon,
  DarkModeIcon,
  GemIcon,
  LightModeIcon,
  SnowflakeIcon,
  ThemeIcon,
} from './Icons';
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
          id: 'winter',
          onClick: () => setTheme(AppTheme.WINTER),
          children: (
            <>
              <SnowflakeIcon className="h-6 w-6" />
              Winter
            </>
          ),
        },
        {
          id: 'business',
          onClick: () => setTheme(AppTheme.BUSINESS),
          children: (
            <>
              <BusinessIcon className="h-6 w-6" />
              Business
            </>
          ),
        },
        {
          id: 'emerald',
          onClick: () => setTheme(AppTheme.EMERALD),
          children: (
            <>
              <GemIcon className="h-6 w-6" />
              Emerald
            </>
          ),
        },
        {
          id: 'cyberpunk',
          onClick: () => setTheme(AppTheme.CYBERPUNK),
          children: (
            <>
              <CyberpunkIcon className="h-6 w-6" />
              Cyberpunk
            </>
          ),
        },
      ]}
      menuClassName="rounded-box p-2 right-0"
    />
  );
};
