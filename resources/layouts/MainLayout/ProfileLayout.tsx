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
    <div className="flex flex-1 flex-col gap-3 p-3">
      <ProfileTabs />
      <Outlet />
    </div>
  );
};
