import {
  Card as DaisyUICard,
  CardProps as DaisyUICardProps,
  Progress,
} from 'react-daisyui';

export interface CardProps extends DaisyUICardProps {
  isLoading?: boolean;
}

export const LoadingCard = ({
  children,
  isLoading,
  ...props
}: CardProps): JSX.Element => (
  <DaisyUICard {...props}>
    {isLoading === true ? (
      <div className="flex-1 flex items-center justify-center">
        <Progress className="w-56" />
      </div>
    ) : (
      children
    )}
  </DaisyUICard>
);
