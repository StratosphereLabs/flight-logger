import { useMemo } from 'react';
import { Input, InputProps } from 'react-daisyui';
import {
  FieldValues,
  Path,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { Transform } from '../types';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';

export interface FormControlProps<Values extends FieldValues, TOutput>
  extends Omit<InputProps, 'name'> {
  controllerProps?: Omit<UseControllerProps<Values>, 'name'>;
  isRequired?: boolean;
  labelText?: string;
  name: Path<Values>;
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
        name={name}
        onChange={({ target: { value } }) =>
          field.onChange(
            transform !== undefined ? transform.output(value) : value,
          )
        }
        value={inputValue}
        color={error === undefined ? 'ghost' : 'error'}
        {...props}
      />
      {error?.message !== undefined ? (
        <FormError errorText={error.message} />
      ) : null}
    </div>
  );
};
