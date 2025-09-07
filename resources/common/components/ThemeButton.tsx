/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error */
import { DropdownMenu } from 'stratosphere-ui';

import { AppTheme, useThemeStore } from '../../stores';
import {
  CyberpunkIcon,
  DarkModeIcon,
  DarkModeOutlineIcon,
  FantasyIcon,
  ForestIcon,
  GemIcon,
  LightModeIcon,
  SunsetIcon,
  ThemeIcon,
} from './Icons';

export const ThemeButton = (): JSX.Element => {
  const { setTheme } = useThemeStore();
  return (
    <DropdownMenu
      anchor="bottom end"
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
          id: AppTheme.CORPORATE,
          onClick: () => {
            setTheme(AppTheme.CORPORATE);
          },
          children: (
            <>
              <LightModeIcon className="h-5 w-5" />
              Light
            </>
          ),
          listItemProps: {
            // @ts-ignore
            'data-theme': 'corporate',
          },
        },
        {
          id: AppTheme.NIGHT,
          onClick: () => {
            setTheme(AppTheme.NIGHT);
          },
          children: (
            <>
              <DarkModeIcon className="h-5 w-5" />
              Dark
            </>
          ),
          listItemProps: {
            // @ts-ignore
            'data-theme': 'night',
          },
        },
        {
          id: AppTheme.EMERALD,
          onClick: () => {
            setTheme(AppTheme.EMERALD);
          },
          children: (
            <>
              <GemIcon className="h-5 w-5" />
              Emerald
            </>
          ),
          listItemProps: {
            // @ts-ignore
            'data-theme': 'emerald',
          },
        },

        {
          id: AppTheme.FOREST,
          onClick: () => {
            setTheme(AppTheme.FOREST);
          },
          children: (
            <>
              <ForestIcon className="h-5 w-5" />
              Forest
            </>
          ),
          listItemProps: {
            // @ts-ignore
            'data-theme': 'forest',
          },
        },
        {
          id: AppTheme.FANTASY,
          onClick: () => {
            setTheme(AppTheme.FANTASY);
          },
          children: (
            <>
              <FantasyIcon className="h-5 w-5" />
              Fantasy
            </>
          ),
          listItemProps: {
            // @ts-ignore
            'data-theme': 'fantasy',
          },
        },
        {
          id: AppTheme.SYNTHWAVE,
          onClick: () => {
            setTheme(AppTheme.SYNTHWAVE);
          },
          children: (
            <>
              <SunsetIcon className="h-5 w-5" />
              Synthwave
            </>
          ),
          listItemProps: {
            // @ts-ignore
            'data-theme': 'synthwave',
          },
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
          listItemProps: {
            // @ts-ignore
            'data-theme': 'cyberpunk',
          },
        },
        {
          id: AppTheme.ABYSS,
          onClick: () => {
            setTheme(AppTheme.ABYSS);
          },
          children: (
            <>
              <DarkModeOutlineIcon className="h-5 w-5" />
              Abyss
            </>
          ),
          listItemProps: {
            // @ts-ignore
            'data-theme': 'abyss',
          },
        },
      ]}
      menuClassName="w-48 bg-base-200 z-50"
    />
  );
};
