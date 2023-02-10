import { Toast } from 'react-daisyui';
import { Outlet } from 'react-router-dom';
import { AlertMessages } from 'stratosphere-ui';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => (
  <div className={`flex h-screen flex-col justify-between`}>
    <MainNavbar />
    <div className="flex flex-1 flex-col gap-3 p-3">
      <Outlet />
    </div>
    <MainFooter />
    <Toast className="z-50 w-1/2 min-w-[400px]" horizontal="end" vertical="top">
      <AlertMessages maxMessages={4} />
    </Toast>
  </div>
);
