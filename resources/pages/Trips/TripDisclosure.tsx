import classNames from 'classnames';
import { Badge } from 'react-daisyui';
import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Disclosure } from 'stratosphere-ui';
import { UsersRouterOutput } from '../../../app/routes/users';
import { LinkIcon, TrashIcon, UserFlightsTable } from '../../common/components';
import { useCopyToClipboard, useProfileLink } from '../../common/hooks';
import { TripsPageNavigationState } from './Trips';
import { useTripsPageStore } from './tripsPageStore';

export interface TripDisclosureProps {
  trip: UsersRouterOutput['getUserTrips'][number];
}

export const TripDisclosure = ({ trip }: TripDisclosureProps): JSX.Element => {
  const copyToClipboard = useCopyToClipboard();
  const disclosureRef = useRef<HTMLDivElement>(null);
  const { state } = useLocation() as {
    state: TripsPageNavigationState | null;
  };
  const { tripId, username } = useParams();
  const { setActiveTrip, setIsDeleteDialogOpen } = useTripsPageStore();
  const flightsLink = useProfileLink('flights');
  const tripsLink = useProfileLink('trips');
  useEffect(() => {
    if (tripId !== undefined && tripId === trip.id) {
      setTimeout(() => disclosureRef.current?.scrollIntoView());
    }
  }, [tripId, trip.id]);
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
            <div className="flex justify-end">
              <a
                className="btn-ghost btn-sm btn-circle btn sm:btn-md"
                onClick={event => {
                  event.stopPropagation();
                  copyToClipboard(
                    `${tripsLink}/${trip.id}`,
                    'Link copied to clipboard!',
                  );
                }}
              >
                <LinkIcon className="h-5 w-5" />
              </a>
              {username === undefined ? (
                <a
                  className="btn-ghost btn-sm btn-circle btn sm:btn-md"
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
      defaultOpen={trip.id === tripId || trip.id === state?.tripId}
      ref={disclosureRef}
      rounded
    >
      <UserFlightsTable
        className="table-compact"
        data={trip.flights}
        onCopyLink={({ id }) =>
          copyToClipboard(`${flightsLink}/${id}`, 'Link copied to clipboard!')
        }
      />
    </Disclosure>
  );
};
