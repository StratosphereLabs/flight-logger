import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { Button, CardTitle, Form, FormControl } from 'stratosphere-ui';
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
  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.passwordReset.forgotPassword.useMutation({
    onError,
  });
  if (resetLinkSent) {
    return (
      <>
        <CardTitle>Check your email</CardTitle>
        <p>Password reset link sent!</p>
      </>
    );
  }
  return (
    <>
      <div className="flex w-full justify-center">
        <CardTitle>Forgot Password</CardTitle>
      </div>

      <div className="divider">
        <a
          onClick={handleBackToLogin}
          className="link-hover link text-base"
          href="#"
          tabIndex={0}
        >
          Back to Login
        </a>
      </div>

      <Form
        methods={methods}
        onFormSubmit={values => {
          mutate(values, {
            onSuccess: () => {
              setResetLinkSent(true);
            },
          });
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
