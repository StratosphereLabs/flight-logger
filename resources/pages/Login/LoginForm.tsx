import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Link } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { Form, FormControl } from 'stratosphere-ui';
import { useLinkClickHandler } from 'react-router-dom';
import { loginSchema } from '../../../app/schemas';
import { useTRPCErrorHandler } from '../../common/hooks';
import { useAppContext } from '../../providers';
import { trpc } from '../../utils/trpc';

export const LoginForm = (): JSX.Element => {
  const { setToken } = useAppContext();
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
    <Form methods={methods} onFormSubmit={data => mutate(data)}>
      <fieldset disabled={isLoading}>
        <FormControl
          autoComplete="email"
          isRequired
          labelText="Email"
          name="email"
          type="email"
        />
        <FormControl
          autoComplete="current-password"
          isRequired
          labelText="Password"
          name="password"
          type="password"
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
