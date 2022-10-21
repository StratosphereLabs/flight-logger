import { Form, Radio, RadioProps } from 'react-daisyui';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';

export interface RadioOption {
  label: string;
  value: string;
}

export interface FormRadioProps<Values extends FieldValues>
  extends UseControllerProps<Values> {
  labelText?: string;
  options: RadioOption[];
  radioProps?: RadioProps;
}

export const FormRadio = <Values extends FieldValues>({
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
      {labelText !== undefined && <Form.Label title={labelText} />}
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
      {error !== undefined && (
        <label className="label">
          <span className="label-text-alt text-error">{error?.message}</span>
        </label>
      )}
    </>
  );
};
