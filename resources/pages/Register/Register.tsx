import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers';
import { RegisterForm } from './RegisterForm';

export const Register = (): JSX.Element => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn) navigate('/profile');
  }, [isLoggedIn]);
  return <RegisterForm />;
};
