import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Link } from 'react-daisyui';
import { useLinkClickHandler } from 'react-router-dom';
import { Form, FormControl } from '../../common/components';
import { useLoginMutation } from '../../common/hooks';
import { registerSchema } from './schema';

export const RegisterForm = (): JSX.Element => {
  const { isLoading, mutate } = useLoginMutation();
  const handleClick = useLinkClickHandler('/auth/login');
  return (
    <>
      <Card.Title>Register</Card.Title>
      <Form
        defaultValues={{
          email: '',
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
        }}
        onFormSubmit={values => mutate(values)}
        resolver={zodResolver(registerSchema)}
      >
        <fieldset disabled={isLoading}>
          <FormControl
            label="Email"
            name="email"
            autoComplete="email"
            placeholder="Email"
          />
          <FormControl
            label="Username"
            name="username"
            autoComplete="username"
            placeholder="Username"
          />
          <FormControl
            label="First Name"
            name="firstName"
            autoComplete="first-name"
            placeholder="First Name"
          />
          <FormControl
            label="Last Name"
            name="lastName"
            autoComplete="last-name"
            placeholder="Last Name"
          />
          <FormControl
            label="Password"
            name="password"
            autoComplete="new-password"
            type="password"
          />
          <FormControl
            label="Confirm Password"
            name="confirmPassword"
            autoComplete="new-password"
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
            Login
          </Button>
        </div>
      </Form>
    </>
  );
};
