import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Link } from 'react-daisyui';
import { useLinkClickHandler } from 'react-router-dom';
import { loginSchema } from '../../../app/schemas';
import { Form, FormControl } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const LoginForm = (): JSX.Element => {
  const { isLoading, mutate } = trpc.auth.login.useMutation();
  const handleForgotPassword = useLinkClickHandler('/auth/forgot-password');
  const handleRegister = useLinkClickHandler('/auth/register');
  return (
    <Form
      defaultValues={{
        email: '',
        password: '',
      }}
      onFormSubmit={data => mutate(data)}
      resolver={zodResolver(loginSchema)}
    >
      <fieldset disabled={isLoading}>
        <FormControl
          inputProps={{
            autoComplete: 'email',
            placeholder: 'Email',
          }}
          labelText="Email"
          name="email"
        />
        <FormControl
          inputProps={{
            autoComplete: 'current-password',
            placeholder: 'Password',
            type: 'password',
          }}
          labelText="Password"
          name="password"
        />
        <label className="label">
          <Link onClick={handleForgotPassword} className="label-text-alt" hover>
            Forgot password?
          </Link>
          <Link onClick={handleRegister} className="label-text-alt" hover>
            Register
          </Link>
        </label>
      </fieldset>
      <div className="flex flex-col mt-6">
        <Button type="submit" loading={isLoading}>
          Login
        </Button>
      </div>
    </Form>
  );
};
