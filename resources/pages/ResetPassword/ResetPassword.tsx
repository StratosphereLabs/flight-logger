import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Button, CardTitle, Form, PasswordInput } from 'stratosphere-ui';
import { resetPasswordSchema } from '../../../app/schemas';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const ResetPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const { token } = useParams();
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: {
      token: token ?? '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(resetPasswordSchema),
  });
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } =
    trpc.passwordReset.resetPassword.useMutation({
      onSuccess: () => {
        handleSuccess('Password Reset. Please log in again.');
        void navigate({ to: '/auth/login' });
      },
    });
  useTRPCErrorHandler(error);
  return (
    <>
      <CardTitle>Reset Password</CardTitle>
      <Form
        methods={methods}
        onFormSubmit={data => {
          mutate(data);
        }}
      >
        <fieldset disabled={isLoading}>
          <PasswordInput
            autoComplete="new-password"
            inputClassName="bg-base-200"
            isRequired
            labelText="New Password"
            name="password"
          />
          <PasswordInput
            autoComplete="new-password"
            inputClassName="bg-base-200"
            isRequired
            labelText="Confirm New Password"
            name="confirmPassword"
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
