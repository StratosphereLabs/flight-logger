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
            <span className="sr-only">Select Theme</span>
          </>
        ),
        title: 'Select Theme',
      }}
      items={[
        {
          id: AppTheme.LIGHT,
          onClick: () => {
            setTheme(AppTheme.LIGHT);
          },
          children: (
            <>
              <LightModeIcon className="h-5 w-5" />
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
              <DarkModeIcon className="h-5 w-5" />
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
              <MusicIcon className="h-5 w-5" />
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
              <DarkModeOutlineIcon className="h-5 w-5" />
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
              <SnowflakeIcon className="h-5 w-5" />
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
              <SunsetIcon className="h-5 w-5" />
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
              <CyberpunkIcon className="h-5 w-5" />
              Cyberpunk
            </>
          ),
        },
      ]}
      menuClassName="rounded-box right-0 w-48 bg-base-200"
    />
  );
};
