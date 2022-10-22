import { ReactNode, useMemo } from 'react';
import { Input, InputProps } from 'react-daisyui';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { Transform } from '../types';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';

export interface FormControlProps<Values extends FieldValues, TOutput>
  extends UseControllerProps<Values> {
  inputProps?: InputProps & Record<string, unknown>;
  isRequired?: boolean;
  labelText?: string;
  menuContent?: ReactNode;
  transform?: Transform<TOutput>;
}

export const FormControl = <Values extends FieldValues, TOutput>({
  inputProps,
  isRequired,
  labelText,
  menuContent,
  transform,
  ...props
}: FormControlProps<Values, TOutput>): JSX.Element => {
  const {
    field,
    fieldState: { error },
  } = useController(props);
  const inputValue = useMemo(
    () =>
      transform !== undefined ? transform.input(field.value) : field.value,
    [field.value, transform],
  );
  return (
    <div className="form-control w-full">
      {labelText !== undefined ? (
        <FormLabel isRequired={isRequired} labelText={labelText} />
      ) : null}
      <Input
        {...field}
        onChange={({ target: { value } }) =>
          field.onChange(
            transform !== undefined ? transform.output(value) : value,
          )
        }
        value={inputValue}
        color={error === undefined ? 'ghost' : 'error'}
        {...inputProps}
      />
      {menuContent !== undefined ? (
        <div className="relative">
          <div className="absolute min-w-[200px] z-10 mt-[1px] w-full">
            {menuContent}
          </div>
        </div>
      ) : null}
      {error?.message !== undefined ? (
        <FormError errorText={error.message} />
      ) : null}
    </div>
  );
};
