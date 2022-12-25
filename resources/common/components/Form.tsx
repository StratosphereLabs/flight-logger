import { HTMLProps, ReactNode } from 'react';
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';

export interface FormProps<Values extends FieldValues>
  extends HTMLProps<HTMLFormElement> {
  children?: ReactNode;
  methods: UseFormReturn<Values>;
  onFormSubmit: SubmitHandler<Values>;
}

export const Form = <Values extends FieldValues>({
  children,
  methods,
  onFormSubmit,
  ...props
}: FormProps<Values>): JSX.Element => (
  <FormProvider {...methods}>
    <form noValidate onSubmit={methods.handleSubmit(onFormSubmit)} {...props}>
      {children}
    </form>
  </FormProvider>
);

export default Form;
