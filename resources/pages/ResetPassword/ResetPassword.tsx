import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { Form, FormControl } from '../../common/components';
import { useResetPasswordMutation } from '../../common/hooks';
import { resetPasswordSchema } from './schema';

export const ResetPassword = (): JSX.Element => {
  const { token } = useParams();
  const { isLoading, mutate } = useResetPasswordMutation();
  return (
    <Form
      defaultValues={{
        password: '',
        confirmPassword: '',
      }}
      onFormSubmit={data =>
        mutate({
          ...data,
          token: token ?? '',
        })
      }
      resolver={zodResolver(resetPasswordSchema)}
    >
      <fieldset disabled={isLoading}>
        <FormControl
          label="New Password"
          name="password"
          autoComplete="new-password"
          type="password"
        />
        <FormControl
          label="Confirm New Password"
          name="confirmPassword"
          autoComplete="new-password"
          type="password"
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