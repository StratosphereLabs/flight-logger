import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import {
  Button,
  CardTitle,
  Form,
  FormControl,
  PasswordInput,
  // Tooltip,
} from 'stratosphere-ui';

import { registerSchema } from '../../../app/schemas';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
// import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { IPIFY_URL, REDIRECT_URL } from './constants';

export const Register = (): JSX.Element => {
  useAuthPage();
  // const { setToken } = useAuthStore();
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
  const [isFetchIpDataLoading, setIsFetchIpDataLoading] = useState(false);
  // const { isLoading } = trpc.auth.register.useMutation({
  //   onSuccess: ({ token }) => {
  //     setToken(token);
  //   },
  //   onError,
  // });
  const { mutate, isLoading: isCreateRegistrationLoading } =
    trpc.registrations.createRegistration.useMutation({ onError });
  const isLoading = isFetchIpDataLoading || isCreateRegistrationLoading;
  const handleClick = useLinkClickHandler('/auth/login');
  return (
    <>
      <CardTitle>Register</CardTitle>
      <Form
        methods={methods}
        onFormSubmit={values => {
          setIsFetchIpDataLoading(true);
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
          <label className="label">
            <a
              onClick={handleClick}
              className="link-hover link label-text-alt"
              href="#"
              tabIndex={0}
            >
              Already registered? Login
            </a>
          </label>
        </fieldset>
        <div className="mt-6 flex flex-col">
          <Button color="primary" type="submit" loading={isLoading}>
            Register
          </Button>
        </div>
      </Form>
    </>
  );
};
