import { useAuthPage } from '../../common/hooks';
import { RegisterForm } from './RegisterForm';

export const Register = (): JSX.Element => {
  useAuthPage();
  return <RegisterForm />;
};
