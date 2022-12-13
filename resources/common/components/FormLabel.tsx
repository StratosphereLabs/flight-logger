import classNames from 'classnames';
import { forwardRef, HTMLProps } from 'react';

export interface FormLabelProps extends HTMLProps<HTMLLabelElement> {
  isRequired?: boolean;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  (
    { children, className, isRequired, ...props }: FormLabelProps,
    ref,
  ): JSX.Element => (
    <label
      className={classNames('label', 'font-semibold', className)}
      ref={ref}
      {...props}
    >
      <span className="label-text">
        {children}{' '}
        {isRequired === true ? <span className="font-normal">*</span> : null}
      </span>
    </label>
  ),
);
