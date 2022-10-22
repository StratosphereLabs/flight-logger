import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button, Card } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { Form, FormControl } from '../../common/components';
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
  const { error, isLoading, mutate } =
    trpc.passwordReset.forgotPassword.useMutation();
  useTRPCErrorHandler(error?.data);
  if (resetLinkSent) {
    return (
      <>
        <Card.Title>Check your email</Card.Title>
        <p>Password reset link sent!</p>
      </>
    );
  }
  return (
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
          inputProps={{
            autoComplete: 'email',
            placeholder: 'Email',
          }}
          labelText="Email"
          name="email"
        />
      </fieldset>
      <div className="flex flex-col mt-6">
        <Button type="submit" loading={isLoading}>
          Reset Password
        </Button>
      </div>
    </Form>
  );
};
