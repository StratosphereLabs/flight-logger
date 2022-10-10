import { ReactNode } from 'react';
import { Form, Input, InputProps } from 'react-daisyui';
import { Controller, useFormContext } from 'react-hook-form';

export interface FormControlProps extends InputProps {
  label?: string;
  menuContent?: ReactNode;
  name: string;
}

export const FormControl = ({
  label,
  menuContent,
  name,
  ...props
}: FormControlProps): JSX.Element => {
  const { control, formState, getFieldState } = useFormContext();
  const { error } = getFieldState(name, formState);
  return (
    <div className="form-control w-full max-w-xs">
      {label !== undefined && <Form.Label title={label} />}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            color={error === undefined ? 'ghost' : 'error'}
            {...field}
            {...props}
          />
        )}
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
