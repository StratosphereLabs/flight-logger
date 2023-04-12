import classNames from 'classnames';
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
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useParams();
  return (
    <Tabs
      className="my-2 w-full flex-nowrap"
      lifted
      onChange={({ paths }) => paths?.[0] !== undefined && navigate(paths[0])}
      pathname={location.pathname}
      size="lg"
      tabs={[
        {
          id: 'profile',
          paths: [username !== undefined ? `/user/${username}` : '/profile'],
          children: (
            <>
              <HomeIcon />
              <div className="hidden md:block">Profile</div>
            </>
          ),
          className: 'flex flex-1 flex-nowrap gap-2',
        },
        {
          id: 'flights',
          paths: [
            username !== undefined ? `/user/${username}/flights` : '/flights',
          ],
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
          paths: [
            username !== undefined ? `/user/${username}/trips` : '/trips',
          ],
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
          paths: [
            username !== undefined
              ? `/user/${username}/itineraries`
              : '/itineraries',
          ],
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
          paths: [username !== undefined ? '' : '/account'],
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
