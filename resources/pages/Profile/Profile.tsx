import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapCard, ProfileCard, StatsCard } from '../../blocks';
import { DashboardContainer } from '../../common/components';
import { UserResponse } from '../../common/hooks';
import { useAppContext } from '../../providers';

export const Profile = (): JSX.Element => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login');
  }, [isLoggedIn]);
  return (
    <>
      <DashboardContainer>
        <ProfileCard setUser={setUser} />
        <MapCard username={user?.username} />
      </DashboardContainer>
      <DashboardContainer>
        <StatsCard />
      </DashboardContainer>
    </>
  );
};
