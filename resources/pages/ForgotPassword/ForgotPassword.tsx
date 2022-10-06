import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button, Card } from 'react-daisyui';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInput } from '../../common/components';
import { useForgotPasswordMutation } from '../../common/hooks';
import { forgotPasswordSchema } from './schema';

export const ForgotPassword = (): JSX.Element => {
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const { isLoading, mutate } = useForgotPasswordMutation();
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
    shouldUseNativeValidation: false,
  });
  if (resetLinkSent) {
    return (
      <>
        <Card.Title>Check your email</Card.Title>
        <p>Password reset link sent!</p>
      </>
    );
  }
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(data =>
          mutate(data, {
            onSuccess: () => setResetLinkSent(true),
          }),
        )}
      >
        <fieldset disabled={isLoading}>
          <FormInput
            label="Email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            className="input-bordered"
          />
        </fieldset>
        <div className="flex flex-col mt-6">
          <Button type="submit" loading={isLoading}>
            Reset Password
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
