import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { DashboardContainer } from './DashboardContainer';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { StatsCard } from './StatsCard';

export const Profile = (): JSX.Element => {
  const { isLoggedIn } = useAppContext();
  useEffect(() => {
    console.log({ isLoggedIn });
  }, [isLoggedIn]);
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
