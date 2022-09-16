import { Form, Input, InputProps } from 'react-daisyui';
import { Controller, useFormContext } from 'react-hook-form';

export interface FormInputProps extends InputProps {
  label?: string;
  name: string;
}

export const FormInput = ({
  label,
  name,
  ...props
}: FormInputProps): JSX.Element => {
  const { control, formState, getFieldState } = useFormContext();
  const { error } = getFieldState(name, formState);
  return (
    <>
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
      {error !== undefined && (
        <label className="label">
          <span className="label-text-alt text-error">{error?.message}</span>
        </label>
      )}
    </>
  );
};
