import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Card } from 'stratosphere-ui';
import { useAuthStore } from '../../stores';
import { ProfileTabs } from './ProfileTabs';

export const ProfileLayout = (): JSX.Element => {
  const isLoggedIn = useAuthStore(({ token }) => token !== null);
  const navigate = useNavigate();
  const { username } = useParams();
  useEffect(() => {
    if (!isLoggedIn && username === undefined) {
      navigate('/');
    }
  }, [isLoggedIn, username]);
  return (
    <Card className="m-2 flex-1 overflow-y-hidden bg-base-100 shadow-md">
      <ProfileTabs />
      <div className="flex flex-1 flex-col overflow-y-scroll p-2 scrollbar-none scrollbar-track-base-100 scrollbar-thumb-neutral sm:scrollbar">
        <Outlet />
      </div>
    </Card>
  );
};
