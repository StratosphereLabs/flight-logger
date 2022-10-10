import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button, Card } from 'react-daisyui';
import { Form, FormControl } from '../../common/components';
import { useForgotPasswordMutation } from '../../common/hooks';
import { forgotPasswordSchema } from './schema';

export const ForgotPassword = (): JSX.Element => {
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const { isLoading, mutate } = useForgotPasswordMutation();
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
      defaultValues={{
        email: '',
      }}
      onFormSubmit={values =>
        mutate(values, {
          onSuccess: () => setResetLinkSent(true),
        })
      }
      resolver={zodResolver(forgotPasswordSchema)}
    >
      <fieldset disabled={isLoading}>
        <FormControl
          label="Email"
          name="email"
          autoComplete="email"
          placeholder="Email"
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
