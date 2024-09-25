import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import {
  Button,
  CardTitle,
  Form,
  FormControl,
  PasswordInput,
} from 'stratosphere-ui';
import { registerSchema } from '../../../app/schemas';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { SignUpWithGithub } from './SignUpProviders/SignUpWithGithub';
import { SignUpWithGoogle } from './SignUpProviders/SignUpWithGoogle';
import { SignUpWithTwitter } from './SignUpProviders/SignUpWithTwitter';

export const Register = (): JSX.Element => {
  useAuthPage();
  const { setToken } = useAuthStore();
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.auth.register.useMutation({
    onSuccess: ({ token }) => {
      setToken(token);
    },
    onError,
  });

  const handleClick = useLinkClickHandler('/auth/login');

  return (
    <>
      <div className="flex w-full justify-center">
        <CardTitle>Sign Up</CardTitle>
      </div>

      <div className="flex flex-row justify-between gap-3 md:mt-3">
        <SignUpWithGoogle />
        <SignUpWithGithub />
        <SignUpWithTwitter />
      </div>

      <div className="divider">or</div>

      <Form
        methods={methods}
        onFormSubmit={values => {
          mutate(values);

          /*
          setIsFetchIpDataLoading(true);

          This rickrolls people who try to sign up because ETHAN is a fucking cunt.
          AND TUI is a stalker. 
          TODO: REMOVE THIS FUCKING SHIT AND PUT A SWITCH ON THE BACKEND LIKE A NORMAL DEV!!!!!!!!

          const redirect = (): void => {
            setIsFetchIpDataLoading(false);
            window.open(REDIRECT_URL, '_blank');
          };
          fetch(IPIFY_URL)
            .then(response => response.json())
            .then((data: { ip: string }) => {
              mutate(
                {
                  ipv4: data.ip,
                  userAgent: navigator.userAgent,
                  ...values,
                },
                { onSettled: redirect },
              );
            })
            .catch(redirect);
            */
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
          <FormControl
            autoComplete="username"
            inputClassName="bg-base-200"
            isRequired
            labelText="Username"
            name="username"
          />
          <FormControl
            autoComplete="first-name"
            inputClassName="bg-base-200"
            labelText="First Name"
            name="firstName"
          />
          <FormControl
            autoComplete="last-name"
            inputClassName="bg-base-200"
            labelText="Last Name"
            name="lastName"
          />
          <PasswordInput
            autoComplete="new-password"
            inputClassName="bg-base-200"
            isRequired
            labelText="Password"
            name="password"
          />
          <PasswordInput
            autoComplete="new-password"
            inputClassName="bg-base-200"
            isRequired
            labelText="Confirm Password"
            name="confirmPassword"
          />
          <div className="divider">
            Have an account?
            <a
              onClick={handleClick}
              className="link-hover link text-base"
              href="#"
              tabIndex={0}
            >
              Sign In
            </a>
          </div>
        </fieldset>
        <div className="mt-5 flex flex-col">
          <Button color="primary" type="submit" loading={isLoading}>
            Sign Up <Icon icon="mdi:register" width={20} height={20} />
          </Button>
        </div>
      </Form>
    </>
  );
};
