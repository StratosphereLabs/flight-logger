import {
  Card as DaisyUICard,
  CardProps as DaisyUICardProps,
  Progress,
} from 'react-daisyui';

export interface CardProps extends DaisyUICardProps {
  isLoading?: boolean;
}

export const Card = ({
  children,
  isLoading,
  ...props
}: CardProps): JSX.Element => (
  <DaisyUICard {...props}>
    {isLoading === true ? (
      <div className="h-full w-full flex items-center justify-center">
        <Progress className="w-56" />
      </div>
    ) : (
      children
    )}
  </DaisyUICard>
);
