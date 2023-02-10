import classNames from 'classnames';
import { forwardRef } from 'react';
import { Breadcrumbs, Button, Card, ToastProps } from 'react-daisyui';
import { Badge } from 'stratosphere-ui';
import { AddItineraryRequest } from '../../../app/schemas/itineraries';

export interface ItineraryFlightsCardProps
  extends Omit<ToastProps, 'horizontal' | 'vertical'> {
  flights: AddItineraryRequest;
  isLoading?: boolean;
  onDeleteFlight: (index: number) => void;
  onReset: () => void;
  onSubmit: () => void;
}

export const ItineraryFlightsCard = forwardRef<
  HTMLDivElement,
  ItineraryFlightsCardProps
>(
  (
    {
      className,
      flights,
      isLoading,
      onDeleteFlight,
      onReset,
      onSubmit,
      ...props
    }: ItineraryFlightsCardProps,
    ref,
  ): JSX.Element => (
    <Card
      className={classNames('bg-base-100 text-center shadow-lg', className)}
      ref={ref}
      {...props}
    >
      <Card.Body className="flex-row justify-between">
        <Breadcrumbs>
          {flights.map((flight, index) => (
            <Breadcrumbs.Item key={index}>
              <Badge color="info" onDismiss={() => onDeleteFlight(index)}>
                {flight.departureAirportId} / {flight.arrivalAirportId}
              </Badge>
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
        <div className="flex flex-wrap gap-2">
          <Button color="error" onClick={onReset} size="sm">
            Reset
          </Button>
          <Button loading={isLoading} onClick={onSubmit} size="sm">
            Create
          </Button>
        </div>
      </Card.Body>
    </Card>
  ),
);
