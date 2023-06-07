import classNames from 'classnames';
import { HTMLProps, forwardRef } from 'react';
import { Badge, Button } from 'stratosphere-ui';
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
      <div
        className={classNames(
          'card bg-base-100 text-center shadow-lg',
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="card-body flex-row justify-between gap-2">
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
        </div>
      </div>
    );
  },
);
