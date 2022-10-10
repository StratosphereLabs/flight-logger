import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Link } from 'react-daisyui';
import { useLinkClickHandler } from 'react-router-dom';
import { Form, FormInput } from '../../common/components';
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
          <FormInput
            label="Email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            className="input-bordered"
          />
          <FormInput
            label="Username"
            name="username"
            autoComplete="username"
            placeholder="Username"
            className="input-bordered"
          />
          <FormInput
            label="First Name"
            name="firstName"
            autoComplete="first-name"
            placeholder="First Name"
            className="input-bordered"
          />
          <FormInput
            label="Last Name"
            name="lastName"
            autoComplete="last-name"
            placeholder="Last Name"
            className="input-bordered"
          />
          <FormInput
            label="Password"
            name="password"
            autoComplete="new-password"
            className="input-bordered"
            type="password"
          />
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            autoComplete="new-password"
            className="input-bordered"
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
