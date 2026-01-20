import { useGateValue, useStatsigUser } from '@statsig/react-bindings';
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { getToken } from 'firebase/messaging';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
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
  ColoredSnowflakeIcon,
  HomeIcon,
  LeftArrowIcon,
  LogoHorizontal,
  LogoutIcon,
  MenuIcon,
  PlusAirplaneIcon,
  ThemeButton,
} from '../../common/components';
import { useLoggedInUserQuery } from '../../common/hooks';
import { useAddFlightStore } from '../../pages/Profile/components/Flights/addFlightStore';
import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
import {
  AppTheme,
  getIsLoggedIn,
  useAuthStore,
  useIsDarkMode,
  useThemeStore,
} from '../../stores';
import { messaging } from '../../utils/firebase';
import { trpc } from '../../utils/trpc';
import { ProfileFiltersForm } from './ProfileFiltersForm';
import { useMainLayoutStore } from './mainLayoutStore';

export interface MainNavbarProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const MainNavbar = ({ methods }: MainNavbarProps): JSX.Element => {
  const { updateUserSync } = useStatsigUser();
  const christmasThemeEnabled = useGateValue('christmas_theme');
  const utils = trpc.useUtils();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { logout } = useAuthStore();
  const { previousPageName } = useMainLayoutStore();
  const { isAddingFlight } = useAddFlightStore();
  const isDarkMode = useIsDarkMode();
  const { theme } = useThemeStore();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { username } = useParams({
    from: '/pathlessMainLayout/pathlessProfileLayout/user/$username',
  });
  const { flightId } = useParams({
    from: '/pathlessMainLayout/flight/$flightId',
  });
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
    () => pathname.includes('/profile') || pathname.includes('/user/'),
    [pathname],
  );
  const isFlightPage = useMemo(
    () => pathname.includes('/flight/') || pathname.includes('/aircraft/'),
    [pathname],
  );
  const pathsToTabsMap: Record<string, string> = useMemo(
    () => ({
      '/': 'home',
      ...(username !== undefined
        ? {
            [`/user/${username}`]: 'users',
            [`/user/${username}/flights`]: 'users',
          }
        : {
            '/profile': 'profile',
            '/flights': 'profile',
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
          currentTab === 'home' &&
            (theme === AppTheme.CHRISTMAS && christmasThemeEnabled
              ? 'lg:text-white lg:hover:text-white'
              : 'lg:hover:text-primary-content'),
        ),
        onClick: () => {
          if (currentTab !== 'home') {
            void navigate({ to: tabsToPathsMap.home });
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
                currentTab === 'profile' &&
                  (theme === AppTheme.CHRISTMAS && christmasThemeEnabled
                    ? 'lg:text-white lg:hover:text-white'
                    : 'lg:hover:text-primary-content'),
              ),
              onClick: () => {
                if (currentTab !== 'profile') {
                  void navigate({ to: tabsToPathsMap.profile });
                }
              },
            },
            {
              id: 'users',
              children: 'Users',
              className: classNames(
                '[--tab-bg:var(--color-primary)] lg:text-primary-content',
                currentTab === 'users' &&
                  (theme === AppTheme.CHRISTMAS && christmasThemeEnabled
                    ? 'lg:text-white lg:hover:text-white'
                    : 'lg:hover:text-primary-content'),
              ),
              onClick: () => {
                if (currentTab !== 'users') {
                  void navigate({ to: tabsToPathsMap.users });
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
          currentTab === 'data' &&
            (theme === AppTheme.CHRISTMAS && christmasThemeEnabled
              ? 'lg:text-white lg:hover:text-white'
              : 'lg:hover:text-primary-content'),
        ),
        onClick: () => {
          if (currentTab !== 'data') {
            void navigate({ to: tabsToPathsMap.data });
          }
        },
      },
    ],
    [
      christmasThemeEnabled,
      currentTab,
      isLoggedIn,
      navigate,
      tabsToPathsMap,
      theme,
    ],
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
              className="inline-flex gap-0 px-1 normal-case sm:px-4"
              color="ghost"
              onClick={() => {
                void navigate({ to: '/' });
              }}
              title="Home"
            >
              <LogoHorizontal className="text-secondary w-30 md:w-44" />
              {theme === AppTheme.CHRISTMAS && christmasThemeEnabled ? (
                <ColoredSnowflakeIcon className="relative bottom-2 h-5 w-5 rotate-30 transform sm:h-6 sm:w-6" />
              ) : null}
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
                  void navigate({
                    to: '/profile',
                    search: prev => ({ ...prev, addFlight: true }),
                  });
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
                void navigate({ to: '/auth/login' });
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
                    void navigate({ to: '/profile' });
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
                  onClick: () =>
                    navigate({ to: '/profile', search: { addFlight: true } }),
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
                    void navigate({ to: '/account' });
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
              onClick={() => navigate({ to: '..' })}
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
              updateUserSync({});
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
