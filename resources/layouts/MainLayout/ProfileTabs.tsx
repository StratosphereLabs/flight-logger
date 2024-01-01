import classNames from 'classnames';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Tabs } from 'stratosphere-ui';
import {
  CogIcon,
  GlobeIcon,
  HomeIcon,
  ListIcon,
  PlaneIcon,
} from '../../common/components';

export const ProfileTabs = (): JSX.Element => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { username } = useParams();
  const pathsToTabsMap: Record<string, string> = useMemo(
    () => ({
      ...(username !== undefined
        ? {
            [`/user/${username}`]: 'profile',
            [`/user/${username}/flights`]: 'flights',
            [`/user/${username}/trips`]: 'trips',
            [`/user/${username}/itineraries`]: 'itineraries',
          }
        : {
            '/profile': 'profile',
            '/flights': 'flights',
            '/trips': 'trips',
            '/itineraries': 'itineraries',
          }),
      '/account': 'account',
    }),
    [username],
  );
  const tabsToPathsMap: Record<string, string> = useMemo(
    () => ({
      profile: username !== undefined ? `/user/${username}` : '/profile',
      flights:
        username !== undefined ? `/user/${username}/flights` : '/flights',
      trips: username !== undefined ? `/user/${username}/trips` : '/trips',
      itineraries:
        username !== undefined
          ? `/user/${username}/itineraries`
          : '/itineraries',
      account: '/account',
    }),
    [username],
  );
  return (
    <Tabs
      className="w-full flex-nowrap p-1 sm:p-2"
      lifted
      onChange={({ id }) => {
        navigate(tabsToPathsMap[id]);
      }}
      selectedTabId={pathsToTabsMap[pathname]}
      size="lg"
      tabs={[
        {
          id: 'profile',
          children: (
            <>
              <HomeIcon className="h-5 w-5" />
              <div className="hidden md:block">Profile</div>
            </>
          ),
          className: 'flex flex-1 flex-nowrap gap-2',
        },
        {
          id: 'flights',
          children: (
            <>
              <PlaneIcon />
              <div className="hidden md:block">Flights</div>
            </>
          ),
          className: 'flex flex-1 flex-nowrap gap-2',
        },
        {
          id: 'trips',
          children: (
            <>
              <GlobeIcon className="h-5 w-5" />
              <div className="hidden md:block">Trips</div>
            </>
          ),
          className: 'flex flex-1 flex-nowrap gap-2',
        },
        {
          id: 'itineraries',
          children: (
            <>
              <ListIcon className="h-5 w-5" />
              <div className="hidden md:block">Itineraries</div>
            </>
          ),
          className: 'flex flex-1 flex-nowrap gap-2',
        },
        {
          id: 'account',
          children: (
            <>
              <CogIcon className="h-5 w-5" />
              <div className="hidden md:block">Account</div>
            </>
          ),
          className: classNames(
            'flex flex-1 flex-nowrap gap-2',
            username !== undefined && 'hidden',
          ),
        },
      ]}
    />
  );
};
