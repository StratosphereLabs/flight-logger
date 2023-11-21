import { zodResolver } from '@hookform/resolvers/zod';
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
  const { error, isLoading, mutate } = trpc.auth.register.useMutation({
    onSuccess: ({ token }) => {
      setToken(token);
    },
  });
  useTRPCErrorHandler(error);
  const handleClick = useLinkClickHandler('/auth/login');
  return (
    <>
      <CardTitle>Register</CardTitle>
      <Form
        methods={methods}
        onFormSubmit={values => {
          mutate(values);
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
