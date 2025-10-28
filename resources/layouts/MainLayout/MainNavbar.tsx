import classNames from 'classnames';
import { getToken } from 'firebase/messaging';
import _ from 'lodash';
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
} from 'stratosphere-ui';

import {
  CogIcon,
  HomeIcon,
  LeftArrowIcon,
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
import { useMainLayoutStore } from './mainLayoutStore';

export interface MainNavbarProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const MainNavbar = ({ methods }: MainNavbarProps): JSX.Element => {
  const utils = trpc.useUtils();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { logout } = useAuthStore();
  const { previousPageName } = useMainLayoutStore();
  const { isAddingFlight } = useAddFlightStore();
  const isDarkMode = useIsDarkMode();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { username, flightId } = useParams();
  const { mutate: mutateAddFCMToken } = trpc.users.addFCMToken.useMutation();
  const { data, isFetching } = useLoggedInUserQuery(userData => {
    if (userData.pushNotifications && messaging !== undefined) {
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
  const isFlightPage = useMemo(() => pathname.includes('/flight/'), [pathname]);
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
  const currentTab = pathsToTabsMap[pathname];
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
        className: classNames(
          '[--tab-bg:var(--color-primary)] lg:text-primary-content',
          currentTab === 'home' && 'lg:hover:text-primary-content',
        ),
        onClick: () => {
          if (currentTab !== 'home') {
            navigate(tabsToPathsMap.home);
          }
        },
      },
      ...(isLoggedIn
        ? [
            {
              id: 'profile',
              children: 'Profile',
              className: classNames(
                '[--tab-bg:var(--color-primary)] lg:text-primary-content',
                currentTab === 'profile' && 'lg:hover:text-primary-content',
              ),
              onClick: () => {
                if (currentTab !== 'profile') {
                  navigate(tabsToPathsMap.profile);
                }
              },
            },
            {
              id: 'users',
              children: 'Users',
              className: classNames(
                '[--tab-bg:var(--color-primary)] lg:text-primary-content',
                currentTab === 'users' && 'lg:hover:text-primary-content',
              ),
              onClick: () => {
                if (currentTab !== 'users') {
                  navigate(tabsToPathsMap.users);
                }
              },
            },
          ]
        : []),
      {
        id: 'data',
        children: 'Data',
        className: classNames(
          '[--tab-bg:var(--color-primary)] lg:text-primary-content',
          currentTab === 'data' && 'lg:hover:text-primary-content',
        ),
        onClick: () => {
          if (currentTab !== 'data') {
            navigate(tabsToPathsMap.data);
          }
        },
      },
    ],
    [currentTab, isLoggedIn, navigate, tabsToPathsMap],
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
              // remove the background on hover

              className="inline-flex border-none bg-transparent px-1 normal-case shadow-none outline-none hover:border-none hover:bg-transparent hover:shadow-none hover:outline-none focus:outline-none active:outline-none sm:px-4"
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
            <div
              role="tablist"
              className="tabs tabs-box tabs-lg bg-transparent p-0 shadow-none"
            >
              {tabs.map(({ className, id, ...tab }) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  className={classNames(
                    'tab',
                    currentTab === id && 'tab-active',
                    className,
                  )}
                  {...tab}
                />
              ))}
            </div>
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
        {isFlightPage ? (
          <div className="flex p-1">
            <Button
              className="text-sm"
              color="ghost"
              size="xs"
              onClick={() => {
                navigate(-1);
              }}
            >
              <LeftArrowIcon className="h-3 w-3" /> Back to{' '}
              {previousPageName ?? 'Home'}
            </Button>
          </div>
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
              if (flightId !== undefined) {
                utils.flights.getFlight.setData(
                  { id: flightId },
                  previousData => ({
                    ..._.omit(previousData, 'id'),
                    id: flightId,
                    otherTravelers: [],
                  }),
                );
              }
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
