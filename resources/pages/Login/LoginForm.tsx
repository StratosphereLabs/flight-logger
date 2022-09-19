import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Link } from 'react-daisyui';
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
  const handleClick = useLinkClickHandler('/auth/forgot-password');
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(data => mutate(data))}>
        <fieldset disabled={isLoading}>
          <Form>
            <FormInput
              label="Email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              className="input-bordered"
            />
          </Form>
          <Form>
            <FormInput
              label="Password"
              name="password"
              autoComplete="current-password"
              type="password"
              placeholder="Password"
              className="input-bordered"
            />
            <label className="label">
              <Link onClick={handleClick} className="label-text-alt" hover>
                Forgot password?
              </Link>
            </label>
          </Form>
        </fieldset>
        <Form className="mt-6">
          <Button type="submit" loading={isLoading}>
            Login
          </Button>
        </Form>
      </form>
    </FormProvider>
  );
};
