import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { getIsLoggedIn, useAuthStore } from '../../stores';

export const useAuthPage = (redirectPath?: string): void => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => {
        void navigate({ to: redirectPath ?? '/profile' });
      }, 0);
    }
  }, [isLoggedIn, navigate, redirectPath]);
};
