import classNames from 'classnames';
import { Children, ForwardedRef, forwardRef } from 'react';
import { Menu, MenuProps } from 'react-daisyui';

export interface DropdownMenuProps extends MenuProps {}

export const DropdownMenu = forwardRef(
  (
    { children, className, ...props }: DropdownMenuProps,
    ref: ForwardedRef<HTMLUListElement>,
  ): JSX.Element => (
    <Menu
      className={classNames(
        'bg-base-100',
        'shadow-xl',
        'p-2',
        'rounded-box',
        Children.toArray(children).length === 0 && 'hidden',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Menu>
  ),
);

DropdownMenu.displayName = 'DropdownMenu';
