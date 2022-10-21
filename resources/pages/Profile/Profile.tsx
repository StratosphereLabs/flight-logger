import { MapCard, ProfileCard, StatsCard } from '../../blocks';
import { DashboardContainer } from '../../common/components';
import { useProtectedPage } from '../../common/hooks';

export const Profile = (): JSX.Element => {
  useProtectedPage();
  return (
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
};
