import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Link } from 'react-daisyui';
import { useLinkClickHandler } from 'react-router-dom';
import { registerSchema } from '../../../app/schemas';
import { Form, FormControl } from '../../common/components';
import { useLoginMutation } from '../../common/hooks';

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
            inputProps={{
              autoComplete: 'email',
              placeholder: 'Email',
              type: 'email',
            }}
            labelText="Email"
            name="email"
          />
          <FormControl
            inputProps={{
              autoComplete: 'username',
              placeholder: 'Username',
            }}
            labelText="Username"
            name="username"
          />
          <FormControl
            inputProps={{
              autoComplete: 'first-name',
              placeholder: 'First Name',
            }}
            labelText="First Name"
            name="firstName"
          />
          <FormControl
            inputProps={{
              autoComplete: 'last-name',
              placeholder: 'Last Name',
            }}
            labelText="Last Name"
            name="lastName"
          />
          <FormControl
            inputProps={{
              autoComplete: 'new-password',
              type: 'password',
            }}
            labelText="Password"
            name="password"
          />
          <FormControl
            inputProps={{
              autoComplete: 'new-password',
              type: 'password',
            }}
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
            Login
          </Button>
        </div>
      </Form>
    </>
  );
};
