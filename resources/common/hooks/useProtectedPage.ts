import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIsLoggedIn, useAuthStore } from '../../stores';

export const useProtectedPage = (): void => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);
};
