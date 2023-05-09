import { Toast } from 'react-daisyui';
import { Outlet } from 'react-router-dom';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  return (
    <div className={`flex h-screen flex-col justify-between`}>
      <MainNavbar />
      <div className="flex flex-1 flex-col overflow-y-scroll">
        <Outlet />
      </div>
      <MainFooter />
      {alertMessages.length > 0 ? (
        <Toast
          className="z-50 w-1/2 min-w-[400px]"
          horizontal="end"
          vertical="top"
        >
          <AlertMessages maxMessages={4} />
        </Toast>
      ) : null}
    </div>
  );
};
