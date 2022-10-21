import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button, Card } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { Form, FormControl } from '../../common/components';
import { trpc } from '../../utils/trpc';
import { forgotPasswordSchema } from './schema';

export const ForgotPassword = (): JSX.Element => {
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { isLoading, mutate } = trpc.passwordReset.forgotPassword.useMutation();
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
