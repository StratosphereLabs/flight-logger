import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers';

export const useProtectedPage = (): void => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate('/');
  }, [isLoggedIn]);
};
