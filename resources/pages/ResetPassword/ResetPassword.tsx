import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form } from 'react-daisyui';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { FormInput } from '../../common/components';
import { useResetPasswordMutation } from '../../common/hooks';
import { resetPasswordSchema } from './schema';

export const ResetPassword = (): JSX.Element => {
  const { token } = useParams();
  const { isLoading, mutate } = useResetPasswordMutation();
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(resetPasswordSchema),
    shouldUseNativeValidation: false,
  });
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(data =>
          mutate({
            ...data,
            token: token ?? '',
          }),
        )}
      >
        <fieldset disabled={isLoading}>
          <Form>
            <FormInput
              label="New Password"
              name="password"
              autoComplete="new-password"
              className="input-bordered"
              type="password"
            />
          </Form>
          <Form>
            <FormInput
              label="Confirm New Password"
              name="confirmPassword"
              autoComplete="new-password"
              className="input-bordered"
              type="password"
            />
          </Form>
        </fieldset>
        <Form className="mt-6">
          <Button type="submit" loading={isLoading}>
            Reset Password
          </Button>
        </Form>
      </form>
    </FormProvider>
  );
};
