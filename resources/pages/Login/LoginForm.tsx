import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Link } from 'react-daisyui';
import { FormProvider, useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import { FormInput } from '../../common/components';
import { loginSchema } from './schema';
import { useLoginMutation } from './useLoginMutation';

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
              placeholder="email"
              className="input-bordered"
            />
          </Form>
          <Form>
            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="password"
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
