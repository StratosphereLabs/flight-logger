import {
  Card as DaisyUICard,
  CardProps as DaisyUICardProps,
} from 'react-daisyui';
import { FullScreenLoader } from './FullScreenLoader';

export interface CardProps extends DaisyUICardProps {
  isLoading?: boolean;
}

export const LoadingCard = ({
  children,
  isLoading,
  ...props
}: CardProps): JSX.Element => (
  <DaisyUICard {...props}>
    {isLoading === true ? <FullScreenLoader /> : children}
  </DaisyUICard>
);
