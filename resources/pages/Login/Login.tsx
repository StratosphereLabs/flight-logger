import { zodResolver } from '@hookform/resolvers/zod';
import { useStatsigClient } from '@statsig/react-bindings';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  CardTitle,
  Form,
  FormControl,
  PasswordInput,
} from 'stratosphere-ui';

import { loginSchema } from '../../../app/schemas';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const Login = (): JSX.Element => {
  useAuthPage();
  const { client } = useStatsigClient();
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
  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.auth.login.useMutation({
    onSuccess: ({ token }) => {
      setToken(token);
    },
    onError,
  });
  useEffect(() => {
    client.logEvent('login_page_viewed');
  }, [client]);

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
          <div className="flex w-full justify-between">
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
          </div>
        </fieldset>
        <div className="mt-6 flex flex-col">
          <Button
            color="primary"
            disabled={isLoading}
            loading={isLoading}
            soft
            type="submit"
          >
            Login
          </Button>
        </div>
      </Form>
    </>
  );
};
