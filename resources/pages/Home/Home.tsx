import { DashboardContainer } from './DashboardContainer';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { StatsCard } from './StatsCard';

export const Home = (): JSX.Element => (
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
