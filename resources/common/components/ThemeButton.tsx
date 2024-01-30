import { DropdownMenu } from 'stratosphere-ui';
import { AppTheme, useThemeStore } from '../../stores';
import {
  CoffeeIcon,
  CyberpunkIcon,
  DarkModeIcon,
  DarkModeOutlineIcon,
  LemonIcon,
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
          id: AppTheme.COFFEE,
          onClick: () => {
            setTheme(AppTheme.COFFEE);
          },
          children: (
            <>
              <CoffeeIcon className="h-4 w-4" />
              Coffee
            </>
          ),
        },
        {
          id: AppTheme.LEMONADE,
          onClick: () => {
            setTheme(AppTheme.LEMONADE);
          },
          children: (
            <>
              <LemonIcon className="h-4 w-4" />
              Lemonade
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
