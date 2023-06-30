import { Outlet } from 'react-router-dom';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  return (
    <div className="flex h-screen flex-col justify-between bg-base-200">
      <MainNavbar />
      <Outlet />
      <MainFooter />
      {alertMessages.length > 0 ? (
        <div className="toast-end toast toast-top z-50 w-1/2 min-w-[400px]">
          <AlertMessages maxMessages={4} />
        </div>
      ) : null}
    </div>
  );
};
