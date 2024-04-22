import { DropdownMenu } from 'stratosphere-ui';
import { AppTheme, useThemeStore } from '../../stores';
import {
  CyberpunkIcon,
  DarkModeIcon,
  DarkModeOutlineIcon,
  LightModeIcon,
  MusicIcon,
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
          id: AppTheme.LIGHT,
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
          id: AppTheme.DARK,
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
          id: AppTheme.LOFI,
          onClick: () => {
            setTheme(AppTheme.LOFI);
          },
          children: (
            <>
              <MusicIcon className="h-4 w-4" />
              Lofi
            </>
          ),
        },
        {
          id: AppTheme.NIGHT,
          onClick: () => {
            setTheme(AppTheme.NIGHT);
          },
          children: (
            <>
              <DarkModeOutlineIcon className="h-4 w-4" />
              Night
            </>
          ),
        },
        {
          id: AppTheme.NORD,
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
          id: AppTheme.SUNSET,
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
          id: AppTheme.CYBERPUNK,
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
