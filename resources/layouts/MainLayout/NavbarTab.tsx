import classNames from 'classnames';
import { NavLink, NavLinkProps } from 'react-router-dom';

export interface NavbarTabProps extends NavLinkProps {
  className?: string;
}

export const NavbarTab = ({
  className,
  ...props
}: NavbarTabProps): JSX.Element => (
  <NavLink
    {...props}
    className={({ isActive }) =>
      classNames('tab', 'tab-lg', isActive && 'tab-active', className)
    }
  />
);
