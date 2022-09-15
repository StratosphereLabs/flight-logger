import { useField } from 'formik';
import { Input, InputProps } from 'react-daisyui';

export interface FormInputProps extends InputProps {
  name: string;
}

export const FormInput = ({ name, ...props }: FormInputProps): JSX.Element => {
  const [, { error, value, touched }, { setTouched, setValue }] =
    useField<string>(name);
  const isInvalid = touched && error !== undefined;
  return (
    <>
      <Input
        color={isInvalid ? 'error' : 'ghost'}
        onBlur={() => setTouched(true)}
        onChange={({ target: { value } }) => setValue(value)}
        value={value}
        {...props}
      />
      <label className="label">
        <span className="label-text-alt">Alt label</span>
      </label>
    </>
  );
};
