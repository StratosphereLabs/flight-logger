import { Divider } from 'react-daisyui';
import { useAuthPage } from '../../common/hooks';
import { GoogleLoginButton } from './GoogleLoginButton';
import { LoginForm } from './LoginForm';

export const Login = (): JSX.Element => {
  useAuthPage();
  return (
    <>
      <GoogleLoginButton width="318px" />
      <Divider>OR</Divider>
      <LoginForm />
    </>
  );
};
