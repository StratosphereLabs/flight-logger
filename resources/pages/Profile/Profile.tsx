import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { DashboardContainer } from '../../common/components';

export const Profile = (): JSX.Element => (
  <DashboardContainer>
    <ProfileCard />
    <MapCard />
  </DashboardContainer>
);
