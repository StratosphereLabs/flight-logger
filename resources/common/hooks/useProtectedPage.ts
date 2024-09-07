import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIsLoggedIn, useAuthStore } from '../../stores';

export const useProtectedPage = (): boolean => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      setTimeout(() => {
        navigate('/auth/login');
      }, 0);
    }
  }, [isLoggedIn, navigate]);
  return isLoggedIn;
};
