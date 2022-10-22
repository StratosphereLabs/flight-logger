import classNames from 'classnames';
import { HTMLProps } from 'react';

export interface FormErrorProps extends HTMLProps<HTMLLabelElement> {
  errorText: string;
}

export const FormError = ({
  className,
  errorText,
  ...props
}: FormErrorProps): JSX.Element => (
  <label className={classNames('label', className)} {...props}>
    <span className="label-text-alt text-error">{errorText}</span>
  </label>
);
