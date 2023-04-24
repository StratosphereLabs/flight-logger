import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';

export const useProtectedPage = (): void => {
  const isLoggedIn = useAuthStore(({ token }) => token !== null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate('/');
  }, [isLoggedIn]);
};
