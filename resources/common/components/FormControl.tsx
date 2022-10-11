import { ReactNode } from 'react';
import { Form, Input, InputProps } from 'react-daisyui';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';

export interface FormControlProps<Values extends FieldValues>
  extends UseControllerProps<Values> {
  inputProps?: InputProps & Record<string, unknown>;
  labelText?: string;
  menuContent?: ReactNode;
}

export const FormControl = <Values extends FieldValues>({
  inputProps,
  labelText,
  menuContent,
  ...props
}: FormControlProps<Values>): JSX.Element => {
  const {
    field,
    fieldState: { error },
  } = useController(props);
  return (
    <div className="form-control w-full max-w-xs">
      {labelText !== undefined && <Form.Label title={labelText} />}
      <Input
        {...field}
        {...inputProps}
        color={error === undefined ? 'ghost' : 'error'}
      />
      {menuContent !== undefined && (
        <div className="relative">
          <div className="absolute min-w-[200px] z-10 mt-[1px] w-full">
            {menuContent}
          </div>
        </div>
      )}
      {error !== undefined && (
        <label className="label">
          <span className="label-text-alt text-error">{error?.message}</span>
        </label>
      )}
    </div>
  );
};
