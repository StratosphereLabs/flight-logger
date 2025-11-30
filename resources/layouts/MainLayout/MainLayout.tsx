import { useEffect, useRef, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Outlet, useParams } from 'react-router-dom';
import Snowfall from 'react-snowfall';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';

import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
import { AppTheme, useThemeStore } from '../../stores';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';
import { useMainLayoutStore } from './mainLayoutStore';

export interface MainLayoutProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const MainLayout = ({ methods }: MainLayoutProps): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { username } = useParams();
  const { theme } = useThemeStore();
  const { setScrollContainerRef } = useMainLayoutStore();
  const [showSnowbank, setShowSnowbank] = useState(false);
  useEffect(() => {
    setShowSnowbank(false);
    const timeout = setTimeout(() => {
      setShowSnowbank(true);
    }, 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, [theme]);
  useEffect(() => {
    setScrollContainerRef(scrollContainerRef);
  }, [setScrollContainerRef]);
  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [username]);
  return (
    <div className="relative flex h-[100dvh] flex-col justify-between">
      {theme === AppTheme.CHRISTMAS ? (
        <Snowfall style={{ zIndex: 50 }} />
      ) : null}
      <MainNavbar methods={methods} />
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
      {theme === AppTheme.CHRISTMAS && showSnowbank ? (
        <div className="fixed bottom-0 left-0 h-[21px] w-full overflow-hidden">
          <div className="animate-rise absolute bottom-0 h-[21px] w-full rounded-t-[30%] bg-[#dee4fd]"></div>
        </div>
      ) : null}
    </div>
  );
};
