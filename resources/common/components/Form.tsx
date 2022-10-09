import { HTMLProps, ReactNode } from 'react';
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
  UseFormProps,
} from 'react-hook-form';

export type FormProps<Values extends FieldValues> = {
  children?: ReactNode;
  formProps?: HTMLProps<HTMLFormElement>;
  onFormSubmit: SubmitHandler<Values>;
} & UseFormProps<Values>;

export const Form = <Values extends FieldValues>({
  children,
  formProps,
  onFormSubmit,
  ...props
}: FormProps<Values>): JSX.Element => {
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    ...props,
  });
  /* eslint-disable @typescript-eslint/no-misused-promises */
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={methods.handleSubmit(onFormSubmit)}
        {...formProps}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;
