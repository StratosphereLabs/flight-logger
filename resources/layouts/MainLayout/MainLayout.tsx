import { type UseFormReturn } from 'react-hook-form';
import { Outlet } from 'react-router-dom';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';
import {
  useProfilePage,
  type ProfileFilterFormData,
} from '../../pages/Profile/hooks';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';
import classNames from 'classnames';

export interface MainLayoutProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const MainLayout = ({ methods }: MainLayoutProps): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  const { isProfilePage } = useProfilePage();
  return (
    <div className="relative flex h-screen flex-col justify-between">
      <MainNavbar methods={methods} />
      <div
        className={classNames(
          'flex flex-1 flex-col overflow-x-hidden overflow-y-scroll bg-base-200',
          isProfilePage ? 'pt-24' : 'pt-16',
        )}
      >
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
