import classNames from 'classnames';
import { forwardRef } from 'react';
import { Breadcrumbs, Button, Card, ToastProps } from 'react-daisyui';
import { Badge } from 'stratosphere-ui';
import { useItineraryFlightsStore } from './itineraryFlightsStore';
import { ResetIcon } from '../../common/components';

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
    } = useItineraryFlightsStore();
    return (
      <Card
        className={classNames('bg-base-100 text-center shadow-lg', className)}
        ref={ref}
        {...props}
      >
        <Card.Body className="flex-row justify-between gap-2">
          <Breadcrumbs className="flex flex-1 items-center">
            {flights.map(({ arrivalAirport, departureAirport, id }) => (
              <Breadcrumbs.Item key={id}>
                <Badge
                  className="font-mono"
                  color="info"
                  dismissable
                  onDismiss={() => {
                    setDeleteFlightId(id);
                    setIsDeleteItineraryModalOpen(true);
                  }}
                >
                  {departureAirport?.iata}/{arrivalAirport?.iata}
                </Badge>
              </Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              color="ghost"
              onClick={() => setIsResetItineraryModalOpen(true)}
              shape="circle"
              size="sm"
            >
              <ResetIcon className="h-6 w-6" />
            </Button>
            <Button
              color="primary"
              loading={isLoading}
              onClick={onSubmit}
              size="sm"
            >
              Create
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  },
);
