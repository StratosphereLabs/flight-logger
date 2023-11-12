import { DropdownMenu } from 'stratosphere-ui';
import { AppTheme, useThemeStore } from '../../stores';
import {
  BusinessIcon,
  CyberpunkIcon,
  DarkModeIcon,
  GemIcon,
  LightModeIcon,
  SnowflakeIcon,
  SunsetIcon,
  ThemeIcon,
} from './Icons';

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
          onClick: () => {
            setTheme(AppTheme.LIGHT);
          },
          children: (
            <>
              <LightModeIcon className="h-4 w-4" />
              Light
            </>
          ),
        },
        {
          id: 'dark',
          onClick: () => {
            setTheme(AppTheme.DARK);
          },
          children: (
            <>
              <DarkModeIcon className="h-4 w-4" />
              Dark
            </>
          ),
        },
        {
          id: 'nord',
          onClick: () => {
            setTheme(AppTheme.NORD);
          },
          children: (
            <>
              <SnowflakeIcon className="h-4 w-4" />
              Nord
            </>
          ),
        },
        {
          id: 'business',
          onClick: () => {
            setTheme(AppTheme.BUSINESS);
          },
          children: (
            <>
              <BusinessIcon className="h-4 w-4" />
              Business
            </>
          ),
        },
        {
          id: 'emerald',
          onClick: () => {
            setTheme(AppTheme.EMERALD);
          },
          children: (
            <>
              <GemIcon className="h-4 w-4" />
              Emerald
            </>
          ),
        },
        {
          id: 'sunset',
          onClick: () => {
            setTheme(AppTheme.SUNSET);
          },
          children: (
            <>
              <SunsetIcon className="h-4 w-4" />
              Sunset
            </>
          ),
        },
        {
          id: 'cyberpunk',
          onClick: () => {
            setTheme(AppTheme.CYBERPUNK);
          },
          children: (
            <>
              <CyberpunkIcon className="h-4 w-4" />
              Cyberpunk
            </>
          ),
        },
      ]}
      menuClassName="rounded-box right-0 bg-base-200"
    />
  );
};
