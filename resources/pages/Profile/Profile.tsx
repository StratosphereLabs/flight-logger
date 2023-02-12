import { MapCard, ProfileCard } from '../../blocks';
import { DashboardContainer } from '../../common/components';

export const Profile = (): JSX.Element => (
  <DashboardContainer>
    <ProfileCard />
    <MapCard />
  </DashboardContainer>
);
