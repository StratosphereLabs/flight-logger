import { useGateValue } from '@statsig/react-bindings';
import { Outlet, useParams } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import Snowfall from 'react-snowfall';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';

import { StatsigInitializationProvider } from '../../providers';
import { AppTheme, useThemeStore } from '../../stores';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';
import { useMainLayoutStore } from './mainLayoutStore';

export const MainLayout = (): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { username } = useParams({ strict: false });
  const { theme } = useThemeStore();
  const christmasThemeEnabled = useGateValue('christmas_theme');
  const { setScrollContainerRef } = useMainLayoutStore();
  const [showSnowbank, setShowSnowbank] = useState(false);
  const [showFooterText, setShowFooterText] = useState(false);
  useEffect(() => {
    setShowSnowbank(false);
    setShowFooterText(false);
    const timeout1 = setTimeout(() => {
      setShowSnowbank(true);
    }, 5000);
    const timeout2 = setTimeout(() => {
      setShowFooterText(true);
    }, 865000);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [theme]);
  useEffect(() => {
    setScrollContainerRef(scrollContainerRef);
  }, [setScrollContainerRef]);
  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [username]);
  return (
    <StatsigInitializationProvider>
      <div className="relative flex h-[100dvh] flex-col justify-between">
        {theme === AppTheme.CHRISTMAS && christmasThemeEnabled ? (
          <Snowfall style={{ zIndex: 50 }} />
        ) : null}
        <MainNavbar />
        <div
          className="bg-base-200 flex flex-1 flex-col justify-between overflow-x-hidden overflow-y-scroll"
          ref={scrollContainerRef}
        >
          <Outlet />
          <MainFooter />
        </div>
        {alertMessages.length > 0 ? (
          <div className="toast toast-end toast-top z-50 w-1/2 min-w-[400px]">
            <AlertMessages maxMessages={4} />
          </div>
        ) : null}
        {theme === AppTheme.CHRISTMAS &&
        christmasThemeEnabled &&
        showSnowbank ? (
          <div className="pointer-events-none fixed bottom-0 left-0 h-[70px] w-full overflow-hidden">
            <div className="animate-rise absolute bottom-0 h-[70px] w-full rounded-t-[30%] bg-[#dee4fd]"></div>
          </div>
        ) : null}
        {theme === AppTheme.CHRISTMAS && christmasThemeEnabled ? (
          <>
            <footer
              className={classNames(
                'footer text-info fixed bottom-0 left-0 flex w-full justify-between overflow-hidden p-5 brightness-75 transition-opacity',
                showFooterText
                  ? 'pointer-events-auto opacity-100'
                  : 'pointer-events-none opacity-0',
              )}
            >
              <div className="truncate">
                <p>
                  <span className="hidden sm:inline-block">Copyright</span> ©{' '}
                  {new Date().getFullYear()}{' '}
                  <a
                    className="link-hover link"
                    href="https://github.com/StratosphereLabs"
                  >
                    Stratosphere Labs
                  </a>
                </p>
              </div>
              <div className="flex gap-1 truncate opacity-75">
                <span className="hidden sm:inline-block">Version</span>{' '}
                {APP_VERSION}{' '}
                <span className="opacity-50">{APP_BUILD_NUMBER}</span>
              </div>
            </footer>
          </>
        ) : null}
      </div>
      <TanStackRouterDevtools />
    </StatsigInitializationProvider>
  );
};
