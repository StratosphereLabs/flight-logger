import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import { ProfileTab } from './ProfileTab';
import {
  CogIcon,
  GlobeIcon,
  HomeIcon,
  ListIcon,
  PlaneIcon,
} from '../../common/components';

export const ProfileTabs = (): JSX.Element => {
  const location = useLocation();
  const username = location.pathname.split('/user/')[1]?.split('/')[0];
  return (
    <div className="tabs mt-2 w-full flex-nowrap">
      <ProfileTab
        end
        to={username !== undefined ? `/user/${username}` : '/profile'}
      >
        <HomeIcon />
        <div className="hidden md:block">Dashboard</div>
      </ProfileTab>
      <ProfileTab
        to={username !== undefined ? `/user/${username}/flights` : '/flights'}
      >
        <PlaneIcon />
        <div className="hidden md:block">Flights</div>
      </ProfileTab>
      <ProfileTab
        to={username !== undefined ? `/user/${username}/trips` : '/trips'}
      >
        <GlobeIcon className="h-5 w-5" />
        <div className="hidden md:block">Trips</div>
      </ProfileTab>
      <ProfileTab
        to={
          username !== undefined
            ? `/user/${username}/itineraries`
            : '/itineraries'
        }
      >
        <ListIcon className="h-5 w-5" />
        <div className="hidden md:block">Itineraries</div>
      </ProfileTab>
      <ProfileTab
        className={classNames(username !== undefined && 'hidden')}
        to={username !== undefined ? '' : '/account'}
      >
        <CogIcon className="h-5 w-5" />
        <div className="hidden md:block">Account</div>
      </ProfileTab>
    </div>
  );
};
