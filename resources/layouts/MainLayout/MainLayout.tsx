import { Outlet } from 'react-router-dom';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  return (
    <div className="flex h-screen flex-col justify-between">
      <MainNavbar />
      <div className="flex flex-1 flex-col overflow-y-scroll bg-base-100 p-3 scrollbar-none scrollbar-track-base-100 scrollbar-thumb-neutral sm:scrollbar">
        <Outlet />
      </div>
      <MainFooter />
      {alertMessages.length > 0 ? (
        <div className="toast toast-end toast-top z-50 w-1/2 min-w-[400px]">
          <AlertMessages maxMessages={4} />
        </div>
      ) : null}
    </div>
  );
};
