import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  DropdownMenu,
  Loading,
  Modal,
  Tabs,
  type TabData,
} from 'stratosphere-ui';
import {
  CogIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  SearchButton,
  ThemeButton,
} from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { getIsLoggedIn, useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const MainNavbar = (): JSX.Element => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { logout } = useAuthStore();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const { data, isFetching } = trpc.users.getUser.useQuery(
    { username: undefined },
    {
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  const pathsToTabsMap: Record<string, string> = useMemo(
    () => ({
      '/': 'home',
      ...(username !== undefined
        ? {
            [`/user/${username}`]: 'users',
            [`/user/${username}/flights`]: 'users',
            [`/user/${username}/trips`]: 'users',
            [`/user/${username}/itineraries`]: 'users',
          }
        : {
            '/profile': 'profile',
            '/flights': 'profile',
            '/trips': 'profile',
            '/itineraries': 'profile',
            '/add-flight': 'profile',
            '/create-itinerary': 'profile',
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
        onClick: () => {
          navigate(tabsToPathsMap.home);
        },
      },
      ...(isLoggedIn
        ? [
            {
              id: 'profile',
              children: 'Profile',
              onClick: () => {
                navigate(tabsToPathsMap.profile);
              },
            },
          ]
        : []),
      {
        id: 'users',
        children: 'Users',
        onClick: () => {
          navigate(tabsToPathsMap.users);
        },
      },
      {
        id: 'data',
        children: 'Data',
        onClick: () => {
          navigate(tabsToPathsMap.data);
        },
      },
    ],
    [isLoggedIn, navigate, tabsToPathsMap],
  );
  return (
    <>
      <div className="navbar z-20 bg-base-200">
        <div className="navbar-start">
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
            className="lg:hidden"
            items={tabs}
            menuClassName="rounded-box w-48 bg-base-200"
          />
          <Button
            className="hidden text-xl normal-case sm:inline-flex"
            color="ghost"
            onClick={() => {
              navigate('/');
            }}
          >
            <div className="font-title text-3xl text-primary transition-all duration-200">
              <span>Flight</span>
              <span className="text-base-content">Logger</span>
            </div>
          </Button>
        </div>
        <div className="navbar-center hidden lg:flex">
          <Tabs
            className="tabs-boxed bg-base-200 p-0"
            onChange={({ id }) => {
              navigate(tabsToPathsMap[id]);
            }}
            selectedTabId={pathsToTabsMap[pathname]}
            size="lg"
            tabs={tabs}
          />
        </div>
        <div className="navbar-end gap-1">
          <SearchButton />
          <ThemeButton />
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
                  navigate('/profile');
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
                onClick: () => {
                  navigate('/add-flight');
                },
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
                  navigate('/account');
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
