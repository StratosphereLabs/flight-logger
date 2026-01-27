import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useProfilePage } from '../../common/hooks';

export const ProfileLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const isAuthorized = useProfilePage();
  useEffect(() => {
    if (!isAuthorized) {
      void navigate({ to: '/auth/login' });
    }
  }, [isAuthorized, navigate]);
  return <Outlet />;
};
