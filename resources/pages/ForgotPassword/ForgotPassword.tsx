import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form } from 'react-daisyui';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInput } from '../../common/components';
import { forgotPasswordSchema } from './schema';
import { useForgotPasswordMutation } from './useForgotPasswordMutation';

export const ForgotPassword = (): JSX.Element => {
  const { isLoading, mutate } = useForgotPasswordMutation();
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
    shouldUseNativeValidation: false,
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(data => mutate(data))}>
        <fieldset disabled={isLoading}>
          <Form>
            <Form.Label title="Email" />
            <FormInput
              name="email"
              placeholder="email"
              className="input-bordered"
            />
          </Form>
        </fieldset>
        <Form className="mt-6">
          <Button type="submit" loading={isLoading}>
            Reset
          </Button>
        </Form>
      </form>
    </FormProvider>
  );
};
