import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Link } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { Form, FormControl, PasswordInput } from 'stratosphere-ui';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { loginSchema } from '../../../app/schemas';

export const Login = (): JSX.Element => {
  useAuthPage();
  const { setToken } = useAuthStore();
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });
  const { error, isLoading, mutate } = trpc.auth.login.useMutation({
    onSuccess: ({ token }) => setToken(token),
  });
  useTRPCErrorHandler(error);
  const handleForgotPassword = useLinkClickHandler('/auth/forgot-password');
  const handleRegister = useLinkClickHandler('/auth/register');
  return (
    <>
      <Card.Title>Sign In</Card.Title>
      <Form methods={methods} onFormSubmit={data => mutate(data)}>
        <fieldset disabled={isLoading}>
          <FormControl
            autoComplete="email"
            isRequired
            labelText="Email"
            name="email"
            type="email"
          />
          <PasswordInput
            autoComplete="current-password"
            isRequired
            labelText="Password"
            name="password"
          />
          <label className="label">
            <Link
              onClick={handleForgotPassword}
              href="#"
              className="label-text-alt"
              hover
              tabIndex={0}
            >
              Forgot password?
            </Link>
            <Link
              onClick={handleRegister}
              href="#"
              className="label-text-alt"
              hover
              tabIndex={0}
            >
              Register
            </Link>
          </label>
        </fieldset>
        <div className="mt-6 flex flex-col">
          <Button color="primary" type="submit" loading={isLoading}>
            Login
          </Button>
        </div>
      </Form>
    </>
  );
};
