import { type UseFormReturn } from 'react-hook-form';
import { Outlet } from 'react-router-dom';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';

import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export interface MainLayoutProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const MainLayout = ({ methods }: MainLayoutProps): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  return (
    <div className="relative flex h-[100dvh] flex-col justify-between">
      <MainNavbar methods={methods} />
      <div className="flex flex-1 flex-col justify-between overflow-x-hidden overflow-y-scroll bg-base-200">
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
