import classNames from 'classnames';
import { HTMLProps } from 'react';

export interface FormLabelProps extends HTMLProps<HTMLLabelElement> {
  isRequired?: boolean;
  labelText: string;
}

export const FormLabel = ({
  className,
  isRequired,
  labelText,
  ...props
}: FormLabelProps): JSX.Element => (
  <label className={classNames('label', 'font-semibold', className)} {...props}>
    <span className="label-text">
      {labelText}{' '}
      {isRequired === true ? <span className="font-normal">*</span> : null}
    </span>
  </label>
);
