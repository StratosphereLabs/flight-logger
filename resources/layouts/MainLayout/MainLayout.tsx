import { Outlet } from 'react-router-dom';
import { AlertMessages } from 'stratosphere-ui';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => (
  <div className={`flex h-screen flex-col justify-between`}>
    <MainNavbar />
    <div className="flex-1 flex flex-col p-3 gap-3">
      <Outlet />
    </div>
    <MainFooter />
    <AlertMessages maxMessages={4} />
  </div>
);
