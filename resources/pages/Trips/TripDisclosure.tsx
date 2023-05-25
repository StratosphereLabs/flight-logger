import { Badge } from 'react-daisyui';
import { useLocation, useParams } from 'react-router-dom';
import { Disclosure } from 'stratosphere-ui';
import { UsersRouterOutput } from '../../../app/routes/users';
import { TrashIcon, UserFlightsTable } from '../../common/components';
import { TripsPageNavigationState } from './Trips';
import { useTripsPageStore } from './tripsPageStore';
import classNames from 'classnames';

export interface TripDisclosureProps {
  trip: UsersRouterOutput['getUserTrips'][number];
}

export const TripDisclosure = ({ trip }: TripDisclosureProps): JSX.Element => {
  const { state } = useLocation() as {
    state: TripsPageNavigationState | null;
  };
  const { username } = useParams();
  const { setActiveTrip, setIsDeleteDialogOpen } = useTripsPageStore();
  return (
    <Disclosure
      buttonProps={{
        children: (
          <div className="flex flex-1 items-center justify-between gap-1 overflow-hidden pr-2">
            <Badge
              className="badge-sm font-normal md:badge-md md:font-semibold"
              color={trip.inFuture ? 'accent' : undefined}
            >
              {trip.outDateISO}
            </Badge>
            <div className="flex flex-1 flex-col gap-2 truncate">
              <span className="truncate">{trip.name}</span>
              <span className="text-xs font-normal opacity-75">
                {trip.tripDuration}
              </span>
            </div>
            <div className="flex justify-end sm:w-[75px]">
              {username === undefined ? (
                <a
                  className="btn-ghost btn-circle btn"
                  onClick={event => {
                    event.stopPropagation();
                    setActiveTrip(trip);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <TrashIcon className="h-5 w-5" />
                </a>
              ) : null}
            </div>
          </div>
        ),
        className: classNames(
          'btn-md sm:btn-lg',
          trip.inFuture ? 'glass' : undefined,
        ),
        color: 'ghost',
      }}
      defaultOpen={trip.id === state?.tripId}
      rounded
    >
      <UserFlightsTable className="table-compact" data={trip.flights} />
    </Disclosure>
  );
};
