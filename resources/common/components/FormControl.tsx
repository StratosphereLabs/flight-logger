import { useMemo } from 'react';
import { Input, InputProps } from 'react-daisyui';
import { FieldValues, useController } from 'react-hook-form';
import { FormFieldProps, Transform } from '../types';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';

export interface FormControlProps<Values extends FieldValues, TOutput>
  extends FormFieldProps<Values>,
    Omit<InputProps, 'name'> {
  transform?: Transform<TOutput>;
}

export const FormControl = <Values extends FieldValues, TOutput>({
  controllerProps,
  isRequired,
  labelText,
  name,
  transform,
  ...props
}: FormControlProps<Values, TOutput>): JSX.Element => {
  const {
    field,
    fieldState: { error },
  } = useController({
    ...controllerProps,
    name,
  });
  const inputValue = useMemo(
    () =>
      transform !== undefined ? transform.input(field.value) : field.value,
    [field.value, transform],
  );
  return (
    <div className="form-control w-full">
      {labelText !== undefined ? (
        <FormLabel isRequired={isRequired}>{labelText}</FormLabel>
      ) : null}
      <Input
        {...field}
        color={error === undefined ? 'ghost' : 'error'}
        name={name}
        onChange={({ target: { value } }) =>
          field.onChange(
            transform !== undefined ? transform.output(value) : value,
          )
        }
        value={inputValue}
        {...props}
      />
      {error?.message !== undefined ? (
        <FormError errorText={error.message} />
      ) : null}
    </div>
  );
};
