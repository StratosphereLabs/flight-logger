import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler, useNavigate } from 'react-router-dom';
import {
  Button,
  CardTitle,
  Form,
  FormControl,
  PasswordInput,
} from 'stratosphere-ui';
import { loginSchema } from '../../../app/schemas';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore, useIsDarkMode } from '../../stores';
import { handleProviderSignIn } from '../../utils/firebase';
import { trpc } from '../../utils/trpc';

export const Login = (): JSX.Element => {
  const navigate = useNavigate();

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
  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.auth.login.useMutation({
    onSuccess: ({ token }) => {
      setToken(token);
    },
    onError,
  });
  const isDarkMode = useIsDarkMode();

  const handleForgotPassword = useLinkClickHandler('/auth/forgot-password');

  return (
    <>
      <div className="flex w-full justify-center">
        <CardTitle>Sign In</CardTitle>
      </div>
      <div className="flex flex-row justify-between gap-3 md:mt-3">
        <Button
          className="flex-1"
          onClick={() => {
            void handleProviderSignIn('google');
          }}
        >
          <Icon icon="mdi:google" height={25} width={25} />
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            void handleProviderSignIn('github');
          }}
        >
          <Icon icon="mdi:github" height={25} width={25} />
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            void handleProviderSignIn('twitter');
          }}
        >
          <Icon icon="fa6-brands:x-twitter" height={25} width={25} />
        </Button>
      </div>

      <div className="divider">or</div>
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
        </fieldset>
        <div className="mt-5 flex flex-col">
          <Button color="primary" type="submit" loading={isLoading}>
            Sign In <Icon icon="mdi:sign-in" width={20} height={20} />
          </Button>

          <div className="divider">
            Forgot password?
            <a
              onClick={handleForgotPassword}
              className="link-hover link text-base"
              href="#"
              tabIndex={0}
            >
              Reset
            </a>
          </div>
          <Button
            color="neutral"
            outline={!isDarkMode}
            className="hover:bg-opacity-0 hover:text-base-content/50"
            onClick={() => {
              navigate('/auth/register');
            }}
          >
            Sign Up <Icon icon="mdi:register" width={20} height={20} />
          </Button>
        </div>
      </Form>
    </>
  );
};
