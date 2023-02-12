import classNames from 'classnames';
import { NavLink, NavLinkProps } from 'react-router-dom';

export interface ProfileTabProps extends Omit<NavLinkProps, 'className'> {
  className?: string;
}

export const ProfileTab = ({
  className,
  ...props
}: ProfileTabProps): JSX.Element => (
  <NavLink
    className={({ isActive }) =>
      classNames(
        'tab tab-lifted tab-lg flex flex-1 flex-nowrap gap-2',
        isActive && 'tab-active',
        className,
      )
    }
    {...props}
  />
);
