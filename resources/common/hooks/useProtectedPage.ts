import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { getIsLoggedIn, useAuthStore } from '../../stores';

export const useProtectedPage = (): boolean => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      setTimeout(() => navigate({ to: '/auth/login' }), 0);
    }
  }, [isLoggedIn, navigate]);
  return isLoggedIn;
};
