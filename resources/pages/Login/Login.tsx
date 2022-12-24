import { useAuthPage } from '../../common/hooks';
import { LoginForm } from './LoginForm';

export const Login = (): JSX.Element => {
  useAuthPage();
  return <LoginForm />;
};
