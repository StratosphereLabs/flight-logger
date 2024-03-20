import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { getIsLoggedIn, useAuthStore } from '../../stores';

export const ProfileLayout = (): JSX.Element => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const navigate = useNavigate();
  const { username } = useParams();
  useEffect(() => {
    if (!isLoggedIn && username === undefined) {
      navigate('/auth/login');
    }
  }, [isLoggedIn, navigate, username]);
  return <Outlet />;
};
