import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context';
import { DashboardContainer } from './DashboardContainer';
import { MapCard } from './MapCard';
import { ProfileCard } from './ProfileCard';
import { StatsCard } from './StatsCard';

export const Profile = (): JSX.Element => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login');
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
