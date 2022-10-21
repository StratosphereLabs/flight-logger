import { HTMLProps, ReactNode } from 'react';
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';

export type FormProps<Values extends FieldValues> = {
  children?: ReactNode;
  formProps?: HTMLProps<HTMLFormElement>;
  methods: UseFormReturn<Values>;
  onFormSubmit: SubmitHandler<Values>;
} & UseFormProps<Values>;

export const Form = <Values extends FieldValues>({
  children,
  formProps,
  methods,
  onFormSubmit,
}: FormProps<Values>): JSX.Element => (
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

export default Form;
