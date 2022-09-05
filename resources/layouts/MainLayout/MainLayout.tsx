import { Outlet } from 'react-router-dom';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => (
  <>
    <MainNavbar />
    <Outlet />
  </>
);
