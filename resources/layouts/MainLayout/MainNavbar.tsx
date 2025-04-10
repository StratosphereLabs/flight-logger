import classNames from 'classnames';
import { getToken } from 'firebase/messaging';
import { useMemo, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  DropdownMenu,
  Loading,
  Modal,
  type TabData,
  Tabs,
} from 'stratosphere-ui';

import {
  CogIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  PlusAirplaneIcon,
  ThemeButton,
} from '../../common/components';
import { useLoggedInUserQuery } from '../../common/hooks';
import { type ProfilePageNavigationState } from '../../pages';
import { useAddFlightStore } from '../../pages/Profile/components/Flights/addFlightStore';
import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
import { getIsLoggedIn, useAuthStore, useIsDarkMode } from '../../stores';
import { messaging } from '../../utils/firebase';
import { trpc } from '../../utils/trpc';
import { ProfileFiltersForm } from './ProfileFiltersForm';

export interface MainNavbarProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const MainNavbar = ({ methods }: MainNavbarProps): JSX.Element => {
  const utils = trpc.useUtils();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { logout } = useAuthStore();
  const { isAddingFlight } = useAddFlightStore();
  const isDarkMode = useIsDarkMode();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { username } = useParams();
  const { mutate: mutateAddFCMToken } = trpc.users.addFCMToken.useMutation();
  const { data, isFetching } = useLoggedInUserQuery(userData => {
    if (userData.pushNotifications) {
      getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
      })
        .then(currentToken => {
          if (currentToken.length > 0) {
            mutateAddFCMToken({ token: currentToken });
          }
        })
        .catch(() => {});
    }
  });
  const isUserPage = useMemo(
    () =>
      (pathname.includes('/profile') || pathname.includes('/user/')) &&
      !pathname.includes('/trips'),
    [pathname],
  );
  const pathsToTabsMap: Record<string, string> = useMemo(
    () => ({
      '/': 'home',
      ...(username !== undefined
        ? {
            [`/user/${username}`]: 'users',
            [`/user/${username}/flights`]: 'users',
            [`/user/${username}/trips`]: 'users',
          }
        : {
            '/profile': 'profile',
            '/flights': 'profile',
            '/trips': 'profile',
            '/add-flight': 'profile',
          }),
      '/users': 'users',
      '/account': 'profile',
      '/data': 'data',
    }),
    [username],
  );
  const tabsToPathsMap: Record<string, string> = useMemo(
    () => ({
      home: '/',
      profile: '/profile',
      users: '/users',
      data: '/data',
    }),
    [],
  );
  const tabs: TabData[] = useMemo(
    () => [
      {
        id: 'home',
        children: 'Home',
        className: 'text-white [--tab-bg:var(--color-primary)]',
        onClick: () => {
          navigate(tabsToPathsMap.home);
        },
      },
      ...(isLoggedIn
        ? [
            {
              id: 'profile',
              children: 'Profile',
              className: 'text-white [--tab-bg:var(--color-primary)]',
              onClick: () => {
                navigate(tabsToPathsMap.profile);
              },
            },
            {
              id: 'users',
              children: 'Users',
              className: 'text-white [--tab-bg:var(--color-primary)]',
              onClick: () => {
                navigate(tabsToPathsMap.users);
              },
            },
          ]
        : []),
      {
        id: 'data',
        children: 'Data',
        className: 'text-white [--tab-bg:var(--color-primary)]',
        onClick: () => {
          navigate(tabsToPathsMap.data);
        },
      },
    ],
    [isLoggedIn, navigate, tabsToPathsMap],
  );
  return (
    <>
      <div
        className={classNames(
          'absolute top-0 left-0 z-30 flex w-full flex-col bg-linear-to-b shadow-md backdrop-blur-sm',
          isDarkMode
            ? 'from-base-100/75 to-base-100/40'
            : 'from-base-100/90 to-base-100/70',
        )}
      >
        <div className="navbar">
          <div className="flex sm:flex-1">
            <DropdownMenu
              anchor="bottom start"
              buttonProps={{
                color: 'ghost',
                children: (
                  <>
                    <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Navigation Menu</span>
                  </>
                ),
                className: 'lg:hidden',
              }}
              items={tabs}
              menuClassName="w-48 bg-base-200 z-50"
            />
            <Button
              className="inline-flex px-1 normal-case sm:px-4"
              color="ghost"
              onClick={() => {
                navigate('/');
              }}
              title="Home"
            >
              <div className="font-title text-primary text-xl transition-all duration-200 sm:text-3xl">
                <span>Flight</span>
                <span className="text-base-content">Logger</span>
              </div>
            </Button>
          </div>
          <div className="hidden flex-1 justify-center lg:flex">
            <Tabs
              box
              className="tabs-boxed bg-transparent p-0 shadow-none"
              onChange={({ id }) => {
                navigate(tabsToPathsMap[id]);
              }}
              selectedTabId={pathsToTabsMap[pathname]}
              size="lg"
              tabs={tabs}
            />
          </div>
          <div className="flex flex-1 justify-end gap-1">
            <ThemeButton />
            {isLoggedIn ? (
              <Button
                className="hidden gap-1 sm:inline-flex"
                color="ghost"
                onClick={() => {
                  navigate(
                    pathname === '/profile' ? `/profile${search}` : '/profile',
                    {
                      state: {
                        addFlight: true,
                      } as const as ProfilePageNavigationState,
                    },
                  );
                }}
                shape="circle"
                title="Add Flight"
              >
                <PlusAirplaneIcon className="h-6 w-6" />
                <span className="sr-only">Add Flight</span>
              </Button>
            ) : null}
            <Button
              className={classNames(isLoggedIn && 'hidden')}
              color="neutral"
              onClick={() => {
                navigate('/auth/login');
              }}
            >
              Login
            </Button>
            <DropdownMenu
              anchor="bottom end"
              buttonProps={{
                children: isFetching ? (
                  <Loading />
                ) : (
                  <Avatar
                    alt={data?.username}
                    src={data?.avatar}
                    shapeClassName="w-9 h-9 rounded-full"
                  />
                ),
                className: classNames(!isLoggedIn && !isFetching && 'hidden'),
                color: 'ghost',
                disabled: isFetching,
                shape: 'circle',
                title: 'Profile Menu',
              }}
              items={[
                {
                  id: 'profile',
                  className: 'rounded-lg',
                  children: (
                    <>
                      <HomeIcon className="h-5 w-5" />
                      My Profile
                    </>
                  ),
                  onClick: () => {
                    navigate('/profile');
                  },
                },
                {
                  id: 'add-flight',
                  className: 'rounded-lg',
                  children: (
                    <>
                      <PlusAirplaneIcon className="h-5 w-5" />
                      Add Flight
                    </>
                  ),
                  onClick: () => {
                    navigate('/profile', {
                      state: {
                        addFlight: true,
                      } as const as ProfilePageNavigationState,
                    });
                  },
                },
                {
                  id: 'settings',
                  className: 'rounded-lg',
                  children: (
                    <>
                      <CogIcon className="h-5 w-5" />
                      Settings
                    </>
                  ),
                  onClick: () => {
                    navigate('/account');
                  },
                },
                {
                  id: 'logout',
                  className: 'rounded-lg bg-red-500/25 font-semibold',
                  children: (
                    <>
                      <LogoutIcon className="h-5 w-5" />
                      Logout
                    </>
                  ),
                  onClick: () => {
                    setIsLogoutDialogOpen(true);
                  },
                },
              ]}
              menuClassName="w-48 bg-base-200 z-50"
            />
          </div>
        </div>
        {isUserPage && !isAddingFlight ? (
          <ProfileFiltersForm methods={methods} />
        ) : null}
      </div>
      <Modal
        actionButtons={[
          {
            children: 'Cancel',
            color: 'secondary',
            onClick: () => {
              setIsLogoutDialogOpen(false);
            },
            soft: true,
          },
          {
            children: 'Log out',
            color: 'primary',
            onClick: async () => {
              logout();
              setIsLogoutDialogOpen(false);
              await utils.users.getUser.cancel();
              await utils.users.getUser.invalidate({ username: undefined });
            },
            soft: true,
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
