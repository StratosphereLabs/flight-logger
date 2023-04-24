import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Link } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { Form, FormControl, PasswordInput } from 'stratosphere-ui';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { registerSchema } from '../../../app/schemas';

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
    onSuccess: ({ token }) => setToken(token),
  });
  useTRPCErrorHandler(error);
  const handleClick = useLinkClickHandler('/auth/login');
  return (
    <>
      <Card.Title>Register</Card.Title>
      <Form methods={methods} onFormSubmit={values => mutate(values)}>
        <fieldset disabled={isLoading}>
          <FormControl
            autoComplete="email"
            isRequired
            labelText="Email"
            name="email"
            type="email"
          />
          <FormControl
            autoComplete="username"
            isRequired
            labelText="Username"
            name="username"
          />
          <FormControl
            autoComplete="first-name"
            labelText="First Name"
            name="firstName"
          />
          <FormControl
            autoComplete="last-name"
            labelText="Last Name"
            name="lastName"
          />
          <PasswordInput
            autoComplete="new-password"
            isRequired
            labelText="Password"
            name="password"
          />
          <PasswordInput
            autoComplete="new-password"
            isRequired
            labelText="Confirm Password"
            name="confirmPassword"
          />
          <label className="label">
            <Link
              onClick={handleClick}
              className="label-text-alt"
              hover
              href="#"
              tabIndex={0}
            >
              Already registered? Login
            </Link>
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
