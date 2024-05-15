import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIsLoggedIn, useAuthStore } from '../../stores';

export const useAuthPage = (redirectPath?: string): void => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => {
        navigate(redirectPath ?? '/profile');
      }, 0);
    }
  }, [isLoggedIn, navigate, redirectPath]);
};
