import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Link } from 'react-daisyui';
import { FormProvider, useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { FormInput } from '../../common/components';
import { useLoginMutation } from '../../common/hooks';
import { loginSchema } from './schema';

export const LoginForm = (): JSX.Element => {
  const { isLoading, mutate } = useLoginMutation();
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
    shouldUseNativeValidation: false,
  });
  const handleForgotPassword = useLinkClickHandler('/auth/forgot-password');
  const handleRegister = useLinkClickHandler('/auth/register');
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(data => mutate(data))}>
        <fieldset disabled={isLoading}>
          <FormInput
            label="Email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            className="input-bordered"
          />
          <FormInput
            label="Password"
            name="password"
            autoComplete="current-password"
            type="password"
            placeholder="Password"
            className="input-bordered"
          />
          <label className="label">
            <Link
              onClick={handleForgotPassword}
              className="label-text-alt"
              hover
            >
              Forgot password?
            </Link>
            <Link onClick={handleRegister} className="label-text-alt" hover>
              Register
            </Link>
          </label>
        </fieldset>
        <div className="flex flex-col mt-6">
          <Button type="submit" loading={isLoading}>
            Login
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
