import { BottomNavigation } from 'react-daisyui';
import { MapCard, ProfileCard, StatsCard } from '../../blocks';
import {
  DashboardContainer,
  GlobeIcon,
  HomeIcon,
  ListIcon,
  PlaneIcon,
} from '../../common/components';
import { useProtectedPage } from '../../common/hooks';

export const Profile = (): JSX.Element => {
  useProtectedPage();
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3 p-3">
        <DashboardContainer>
          <ProfileCard />
          <MapCard />
        </DashboardContainer>
        <DashboardContainer>
          <StatsCard />
        </DashboardContainer>
      </div>
      <div className="flex w-full justify-center">
        <BottomNavigation className="static max-w-[800px]">
          <button className="active">
            <HomeIcon />
            <BottomNavigation.Label>Home</BottomNavigation.Label>
          </button>
          <button>
            <PlaneIcon />
            <BottomNavigation.Label>Flights</BottomNavigation.Label>
          </button>
          <button>
            <GlobeIcon className="h-6 w-6" />
            <BottomNavigation.Label>Trips</BottomNavigation.Label>
          </button>
          <button>
            <ListIcon className="h-6 w-6" />
            <BottomNavigation.Label>Itineraries</BottomNavigation.Label>
          </button>
        </BottomNavigation>
      </div>
    </div>
  );
};
