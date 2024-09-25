import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, CardTitle, Form, PasswordInput } from 'stratosphere-ui';
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
  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.passwordReset.resetPassword.useMutation({
    onSuccess: () => {
      handleSuccess('Password Reset. Please log in again.');
      navigate('/auth/login');
    },
    onError,
  });
  return (
    <>
      <div className="flex w-full justify-center">
        <CardTitle>Change Password</CardTitle>
      </div>
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
            Change Password
          </Button>
        </div>
      </Form>
    </>
  );
};
