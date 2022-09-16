import { Outlet } from 'react-router-dom';
import { AlertMessages } from '../../common/components';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => (
  <div className="flex min-h-screen flex-col justify-between">
    <MainNavbar />
    <Outlet />
    <MainFooter />
    <AlertMessages />
  </div>
);
