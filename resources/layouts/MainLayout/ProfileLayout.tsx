import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { ProfileTabs } from './ProfileTabs';
import { useAuthStore } from '../../stores';

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
    <div className="flex flex-1 flex-col gap-1 pt-1 overflow-y-hidden">
      <ProfileTabs />
      <div className="flex flex-1 flex-col overflow-y-scroll p-2 pt-1">
        <Outlet />
      </div>
    </div>
  );
};
