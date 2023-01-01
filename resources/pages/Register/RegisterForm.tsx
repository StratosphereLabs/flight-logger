import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Link } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { Form, FormControl } from 'stratosphere-ui';
import { registerSchema } from '../../../app/schemas';
import { useTRPCErrorHandler } from '../../common/hooks';
import { useAppContext } from '../../providers';
import { trpc } from '../../utils/trpc';

export const RegisterForm = (): JSX.Element => {
  const { setToken } = useAppContext();
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
          <FormControl
            autoComplete="new-password"
            isRequired
            labelText="Password"
            name="password"
            type="password"
          />
          <FormControl
            autoComplete="new-password"
            isRequired
            labelText="Confirm Password"
            name="confirmPassword"
            type="password"
          />
          <label className="label">
            <Link onClick={handleClick} className="label-text-alt" hover>
              Already registered? Login
            </Link>
          </label>
        </fieldset>
        <div className="flex flex-col mt-6">
          <Button type="submit" loading={isLoading}>
            Register
          </Button>
        </div>
      </Form>
    </>
  );
};
