import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapCard, ProfileCard, StatsCard } from '../../blocks';
import { DashboardContainer } from '../../common/components';
import { useAppContext } from '../../context';

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
