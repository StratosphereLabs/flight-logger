import classNames from 'classnames';
import { HTMLProps } from 'react';

export interface FormLabelProps extends HTMLProps<HTMLLabelElement> {
  isRequired?: boolean;
}

export const FormLabel = ({
  children,
  className,
  isRequired,
  ...props
}: FormLabelProps): JSX.Element => (
  <label className={classNames('label', 'font-semibold', className)} {...props}>
    <span className="label-text">
      {children}{' '}
      {isRequired === true ? <span className="font-normal">*</span> : null}
    </span>
  </label>
);
