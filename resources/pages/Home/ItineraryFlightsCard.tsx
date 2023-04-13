import classNames from 'classnames';
import { forwardRef } from 'react';
import { Breadcrumbs, Button, Card, ToastProps } from 'react-daisyui';
import { Badge } from 'stratosphere-ui';
import { useItineraryFlightsContext } from './ItineraryFlightsProvider';

export interface ItineraryFlightsCardProps
  extends Omit<ToastProps, 'horizontal' | 'vertical'> {
  isLoading?: boolean;
  onSubmit: () => void;
}

export const ItineraryFlightsCard = forwardRef<
  HTMLDivElement,
  ItineraryFlightsCardProps
>(
  (
    { className, isLoading, onSubmit, ...props }: ItineraryFlightsCardProps,
    ref,
  ): JSX.Element => {
    const {
      flights,
      setDeleteFlightId,
      setIsDeleteItineraryModalOpen,
      setIsResetItineraryModalOpen,
    } = useItineraryFlightsContext();
    return (
      <Card
        className={classNames('bg-base-100 text-center shadow-lg', className)}
        ref={ref}
        {...props}
      >
        <Card.Body className="flex-row justify-between gap-2">
          <Breadcrumbs className="flex-1">
            {flights.map(({ arrivalAirportId, departureAirportId, id }) => (
              <Breadcrumbs.Item key={id}>
                <Badge
                  color="info"
                  dismissable
                  onDismiss={() => {
                    setDeleteFlightId(id);
                    setIsDeleteItineraryModalOpen(true);
                  }}
                >
                  {departureAirportId} / {arrivalAirportId}
                </Badge>
              </Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              color="error"
              onClick={() => setIsResetItineraryModalOpen(true)}
              size="sm"
            >
              Reset
            </Button>
            <Button loading={isLoading} onClick={onSubmit} size="sm">
              Create
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  },
);
