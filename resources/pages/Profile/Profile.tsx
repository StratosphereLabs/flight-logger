import { MapCard, ProfileCard, StatsCard } from '../../blocks';
import { DashboardContainer } from '../../common/components';

export const Profile = (): JSX.Element => (
  <>
    <DashboardContainer>
      <ProfileCard />
      <MapCard />
    </DashboardContainer>
    <DashboardContainer>
      <StatsCard />
    </DashboardContainer>
  </>
);
