import { ComponentProps, FC, MouseEvent } from 'react';
import {
  Badge as DaisyUIBadge,
  BadgeProps as DaisyUIBadgeProps,
  Button,
} from 'react-daisyui';
import { CloseIcon } from './Icons';

export interface BadgeProps extends DaisyUIBadgeProps {
  icon?: FC<ComponentProps<'svg'>>;
  onDismiss?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const Badge = ({
  children,
  icon: Icon,
  onDismiss,
  ...props
}: BadgeProps): JSX.Element => (
  <DaisyUIBadge size="lg" {...props}>
    {Icon !== undefined ? <Icon /> : null}
    {children}
    {onDismiss !== undefined ? (
      <Button
        color="ghost"
        size="xs"
        onClick={event => {
          event.stopPropagation();
          onDismiss(event);
        }}
        onKeyDown={event => {
          event.stopPropagation();
        }}
      >
        <CloseIcon />
        <span className="sr-only">Remove badge</span>
      </Button>
    ) : null}
  </DaisyUIBadge>
);
