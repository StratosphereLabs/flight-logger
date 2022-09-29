import { Outlet } from 'react-router-dom';
import { AlertMessages } from '../../common/components';
import { useScrollBar } from '../../common/hooks';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => {
  const scrollBarClassName = useScrollBar();
  return (
    <div className={`flex h-screen flex-col justify-between`}>
      <MainNavbar />
      <Outlet />
      <MainFooter />
      <AlertMessages />
    </div>
  );
};
