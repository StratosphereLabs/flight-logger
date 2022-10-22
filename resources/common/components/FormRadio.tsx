import { Form, Radio, RadioProps } from 'react-daisyui';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';

export interface RadioOption {
  label: string;
  value: string;
}

export interface FormRadioProps<Values extends FieldValues>
  extends UseControllerProps<Values> {
  isRequired?: boolean;
  labelText?: string;
  options: RadioOption[];
  radioProps?: RadioProps;
}

export const FormRadio = <Values extends FieldValues>({
  isRequired,
  labelText,
  options,
  radioProps,
  ...props
}: FormRadioProps<Values>): JSX.Element => {
  const {
    field: { value, ...field },
    fieldState: { error },
  } = useController(props);
  return (
    <>
      {labelText !== undefined ? (
        <FormLabel isRequired={isRequired} labelText={labelText} />
      ) : null}
      {options.map(({ label, value: optionValue }, index) => (
        <Form.Label key={index} title={label}>
          <Radio
            {...field}
            {...radioProps}
            checked={value === optionValue}
            value={optionValue}
          />
        </Form.Label>
      ))}
      {error?.message !== undefined ? (
        <FormError errorText={error.message} />
      ) : null}
    </>
  );
};
