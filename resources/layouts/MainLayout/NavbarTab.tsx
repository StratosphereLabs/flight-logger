import classNames from 'classnames';
import { ReactNode } from 'react';
import { Menu } from 'react-daisyui';
import { NavLink, NavLinkProps } from 'react-router-dom';

export interface NavbarTabProps extends NavLinkProps {
  className?: string;
  subMenu?: ReactNode;
}

export const NavbarTab = ({
  className,
  subMenu,
  ...props
}: NavbarTabProps): JSX.Element => (
  <Menu.Item>
    <NavLink
      {...props}
      className={({ isActive }) =>
        classNames(
          'rounded-lg',
          isActive && ['bg-primary', 'text-white'],
          className,
        )
      }
    />
    {subMenu}
  </Menu.Item>
);
