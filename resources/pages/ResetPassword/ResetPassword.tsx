import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, PasswordInput } from 'stratosphere-ui';
import { resetPasswordSchema } from '../../../app/schemas';
import {
  useAuthPage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const ResetPassword = (): JSX.Element => {
  useAuthPage();
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
        navigate('/auth/login');
      },
    });
  useTRPCErrorHandler(error);
  return (
    <>
      <Card.Title>Reset Password</Card.Title>
      <Form methods={methods} onFormSubmit={data => mutate(data)}>
        <fieldset disabled={isLoading}>
          <PasswordInput
            autoComplete="new-password"
            isRequired
            labelText="New Password"
            name="password"
          />
          <PasswordInput
            autoComplete="new-password"
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
