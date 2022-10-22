import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Link } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { registerSchema } from '../../../app/schemas';
import { Form, FormControl } from '../../common/components';
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
            inputProps={{
              autoComplete: 'email',
              type: 'email',
            }}
            isRequired
            labelText="Email"
            name="email"
          />
          <FormControl
            inputProps={{
              autoComplete: 'username',
            }}
            isRequired
            labelText="Username"
            name="username"
          />
          <FormControl
            inputProps={{
              autoComplete: 'first-name',
            }}
            labelText="First Name"
            name="firstName"
          />
          <FormControl
            inputProps={{
              autoComplete: 'last-name',
            }}
            labelText="Last Name"
            name="lastName"
          />
          <FormControl
            inputProps={{
              autoComplete: 'new-password',
              type: 'password',
            }}
            isRequired
            labelText="Password"
            name="password"
          />
          <FormControl
            inputProps={{
              autoComplete: 'new-password',
              type: 'password',
            }}
            isRequired
            labelText="Confirm Password"
            name="confirmPassword"
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
