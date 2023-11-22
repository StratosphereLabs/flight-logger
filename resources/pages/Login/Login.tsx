import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import {
  Button,
  CardTitle,
  Form,
  FormControl,
  PasswordInput,
} from 'stratosphere-ui';
import { loginSchema } from '../../../app/schemas';
import { useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const Login = (): JSX.Element => {
  const { setToken } = useAuthStore();
  const navigate = useNavigate();
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
    onSuccess: ({ token }) => {
      setToken(token);
    },
  });
  useTRPCErrorHandler(error);
  return (
    <>
      <CardTitle>Sign In</CardTitle>
      <Form
        methods={methods}
        onFormSubmit={data => {
          mutate(data);
        }}
      >
        <fieldset disabled={isLoading}>
          <FormControl
            autoComplete="email"
            inputClassName="bg-base-200"
            isRequired
            labelText="Email"
            name="email"
            type="email"
          />
          <PasswordInput
            autoComplete="current-password"
            inputClassName="bg-base-200"
            isRequired
            labelText="Password"
            name="password"
          />
          <label className="label">
            <a
              onClick={() => navigate({ to: '/auth/forgot-password' })}
              href="#"
              className="link-hover link label-text-alt"
              tabIndex={0}
            >
              Forgot password?
            </a>
            <a
              onClick={() => navigate({ to: '/auth/register' })}
              href="#"
              className="link-hover link label-text-alt"
              tabIndex={0}
            >
              Register
            </a>
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
