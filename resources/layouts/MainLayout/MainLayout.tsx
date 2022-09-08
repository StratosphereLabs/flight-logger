import { Outlet } from 'react-router-dom';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => (
  <>
    <MainNavbar />
    <Outlet />
    <MainFooter />
  </>
);
