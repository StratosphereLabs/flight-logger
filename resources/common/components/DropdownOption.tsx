import classNames from 'classnames';
import { forwardRef, HTMLProps } from 'react';
import { Menu } from 'react-daisyui';
import { CheckIcon } from './Icons';

export interface DropdownOptionProps extends HTMLProps<HTMLAnchorElement> {
  active?: boolean;
  disabled?: boolean;
  selected?: boolean;
}

export const DropdownOption = forwardRef<HTMLLIElement, DropdownOptionProps>(
  ({ active, children, className, selected, ...props }, ref): JSX.Element => (
    <Menu.Item className={classNames(className)} ref={ref}>
      <a className={classNames(active === true && 'active')} {...props}>
        {selected !== undefined ? (
          <div className="w-6 flex justify-center">
            {selected ? <CheckIcon /> : null}
          </div>
        ) : null}
        {children}
      </a>
    </Menu.Item>
  ),
);

DropdownOption.displayName = 'DropdownOption';
