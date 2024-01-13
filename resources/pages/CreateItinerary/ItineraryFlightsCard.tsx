import classNames from 'classnames';
import { type HTMLProps, forwardRef } from 'react';
import { Badge, Button, Card, CardBody } from 'stratosphere-ui';
import { ResetIcon } from '../../common/components';
import { useItineraryFlightsStore } from './itineraryFlightsStore';

export interface ItineraryFlightsCardProps extends HTMLProps<HTMLDivElement> {
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
        className={classNames('bg-info/20 text-center', className)}
        ref={ref}
        {...props}
      >
        <CardBody className="flex-row justify-between gap-2">
          <div className="breadcrumbs flex flex-1 items-center text-sm">
            <ul>
              {flights.map(({ arrivalAirport, departureAirport, id }) => (
                <li key={id}>
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
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              color="ghost"
              onClick={() => {
                setIsResetItineraryModalOpen(true);
              }}
              shape="circle"
            >
              <ResetIcon className="h-6 w-6" />
              <span className="sr-only">Reset Itinerary</span>
            </Button>
            <Button color="primary" loading={isLoading} onClick={onSubmit}>
              Create
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  },
);
