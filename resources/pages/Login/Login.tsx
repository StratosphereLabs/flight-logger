import { Divider } from 'react-daisyui';
import { GoogleLoginButton } from './GoogleLoginButton';
import { LoginForm } from './LoginForm';

export const Login = (): JSX.Element => (
  <>
    <GoogleLoginButton />
    <Divider>OR</Divider>
    <LoginForm />
  </>
);
