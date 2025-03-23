import { useEffect, useRef } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Outlet, useParams } from 'react-router-dom';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';

import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
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
  const { setScrollContainerRef } = useMainLayoutStore();
  useEffect(() => {
    setScrollContainerRef(scrollContainerRef);
  }, [setScrollContainerRef]);
  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [username]);
  return (
    <div className="relative flex h-[100dvh] flex-col justify-between">
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
    </div>
  );
};
