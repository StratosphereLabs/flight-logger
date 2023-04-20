import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button, Card, Link } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { Form, FormControl } from 'stratosphere-ui';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { forgotPasswordSchema } from './schema';

export const ForgotPassword = (): JSX.Element => {
  useAuthPage();
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
  });
  const handleBackToLogin = useLinkClickHandler('/auth/login');
  const { error, isLoading, mutate } =
    trpc.passwordReset.forgotPassword.useMutation();
  useTRPCErrorHandler(error);
  if (resetLinkSent) {
    return (
      <>
        <Card.Title>Check your email</Card.Title>
        <p>Password reset link sent!</p>
      </>
    );
  }
  return (
    <>
      <Card.Title>Forgot Password</Card.Title>
      <Form
        methods={methods}
        onFormSubmit={values =>
          mutate(values, {
            onSuccess: () => setResetLinkSent(true),
          })
        }
      >
        <fieldset disabled={isLoading}>
          <FormControl
            autoComplete="email"
            isRequired
            labelText="Email"
            name="email"
            type="email"
          />
          <label className="label">
            <Link
              onClick={handleBackToLogin}
              className="label-text-alt"
              hover
              href="#"
              tabIndex={0}
            >
              Back to Login
            </Link>
          </label>
        </fieldset>
        <div className="mt-6 flex flex-col">
          <Button color="primary" type="submit" loading={isLoading}>
            Reset Password
          </Button>
        </div>
      </Form>
    </>
  );
};
