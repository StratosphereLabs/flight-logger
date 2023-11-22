import { useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { useState } from 'react';
import { Avatar, Button, DropdownMenu, Loading, Modal } from 'stratosphere-ui';
import {
  ThemeButton,
  MenuIcon,
  SearchButton,
  LogoutIcon,
  HomeIcon,
  PlusIcon,
  CogIcon,
} from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const MainNavbar = (): JSX.Element => {
  const isLoggedIn = useAuthStore(({ token }) => token !== null);
  const { logout } = useAuthStore();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { data, error, isFetching } = trpc.users.getUser.useQuery(
    { username: undefined },
    {
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000,
    },
  );
  useTRPCErrorHandler(error);
  return (
    <>
      <div className="component-preview flex w-full items-center justify-center gap-2 p-2 font-sans">
        <div className="navbar justify-between rounded-box bg-base-100 shadow-md lg:justify-start">
          <div className="navbar-start w-auto lg:w-1/2">
            <DropdownMenu
              buttonProps={{
                color: 'ghost',
                children: (
                  <>
                    <MenuIcon />
                    <span className="sr-only">Navigation Menu</span>
                  </>
                ),
              }}
              items={[
                {
                  id: 'home',
                  children: 'Home',
                  onClick: () => navigate({ to: '/' }),
                },
                {
                  id: 'add-itinerary',
                  children: 'Create Itinerary',
                  onClick: () => navigate({ to: '/create-itinerary' }),
                },
                {
                  id: 'data',
                  children: 'Data',
                  onClick: () => navigate({ to: '/data' }),
                },
              ]}
              menuClassName="rounded-box w-48 bg-base-200"
            />
          </div>
          <div className="navbar-center hidden lg:flex">
            <Button
              className="hidden text-xl normal-case sm:inline-flex"
              color="ghost"
              onClick={() => navigate({ to: '/' })}
            >
              <div className="font-title text-3xl text-primary transition-all duration-200">
                <span>Flight</span>
                <span className="text-base-content">Logger</span>
              </div>
            </Button>
          </div>
          <div className="navbar-end w-auto space-x-1 lg:w-1/2">
            <SearchButton />
            <ThemeButton />
            <Button
              className={classNames(isLoggedIn && 'hidden')}
              onClick={() => navigate({ to: '/auth/login' })}
            >
              Login
            </Button>
            <DropdownMenu
              className={classNames(!isLoggedIn && !isFetching && 'hidden')}
              buttonProps={{
                children: isFetching ? (
                  <Loading />
                ) : (
                  <Avatar shapeClassName="w-9 h-9 rounded-full">
                    <img alt={data?.username} src={data?.avatar} />
                  </Avatar>
                ),
                color: 'ghost',
                disabled: isFetching,
                shape: 'circle',
              }}
              items={[
                {
                  id: 'profile',
                  className: 'rounded-lg',
                  children: (
                    <>
                      <HomeIcon className="h-4 w-4" />
                      My Profile
                    </>
                  ),
                  onClick: () => {
                    // navigate({ to: '/profile' });
                  },
                },
                {
                  id: 'add-flight',
                  className: 'rounded-lg',
                  children: (
                    <>
                      <PlusIcon className="h-4 w-4" />
                      Add Flight
                    </>
                  ),
                  onClick: () => navigate({ to: '/add-flight' }),
                },
                {
                  id: 'settings',
                  className: 'rounded-lg',
                  children: (
                    <>
                      <CogIcon className="h-4 w-4" />
                      Settings
                    </>
                  ),
                  onClick: () => {
                    // navigate('/account');
                  },
                },
                {
                  id: 'logout',
                  className: 'rounded-lg bg-red-500/25 font-semibold',
                  children: (
                    <>
                      <LogoutIcon className="h-4 w-4" />
                      Logout
                    </>
                  ),
                  onClick: () => {
                    setIsLogoutDialogOpen(true);
                  },
                },
              ]}
              menuClassName="rounded-box right-0 w-48 bg-base-200"
            />
          </div>
        </div>
      </div>
      <Modal
        actionButtons={[
          {
            children: 'Cancel',
            color: 'secondary',
            outline: true,
            onClick: () => {
              setIsLogoutDialogOpen(false);
            },
          },
          {
            children: 'Log out',
            color: 'primary',
            onClick: () => {
              logout();
              setIsLogoutDialogOpen(false);
            },
          },
        ]}
        onClose={() => {
          setIsLogoutDialogOpen(false);
        }}
        open={isLogoutDialogOpen}
        title="Are you sure?"
      >
        <div className="pt-4">
          Please press <strong>Log Out</strong> to sign out of{' '}
          <strong>{data?.username}</strong>
        </div>
      </Modal>
    </>
  );
};
