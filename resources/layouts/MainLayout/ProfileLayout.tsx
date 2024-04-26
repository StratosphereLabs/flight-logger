import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useProfilePage } from '../../pages/Profile/hooks';

export const ProfileLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const { isAuthorized } = useProfilePage();
  useEffect(() => {
    if (!isAuthorized) {
      setTimeout(() => {
        navigate('/auth/login');
      }, 0);
    }
  }, [isAuthorized, navigate]);
  return <Outlet />;
};
