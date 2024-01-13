import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores';

export const ProfileLayout = (): JSX.Element => {
  const isLoggedIn = useAuthStore(({ token }) => token !== null);
  const navigate = useNavigate();
  const { username } = useParams();
  useEffect(() => {
    if (!isLoggedIn && username === undefined) {
      navigate('/');
    }
  }, [isLoggedIn, navigate, username]);
  return <Outlet />;
};
