import { useEffect } from 'react';
import { Divider } from 'react-daisyui';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers';
import { GoogleLoginButton } from './GoogleLoginButton';
import { LoginForm } from './LoginForm';

export const Login = (): JSX.Element => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn) navigate('/profile');
  }, [isLoggedIn]);
  return (
    <>
      <GoogleLoginButton width="318px" />
      <Divider>OR</Divider>
      <LoginForm />
    </>
  );
};
