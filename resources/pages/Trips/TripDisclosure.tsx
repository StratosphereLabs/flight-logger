import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Badge, Disclosure } from 'stratosphere-ui';
import { type UsersRouterOutput } from '../../../app/routes/users';
import { LinkIcon, TrashIcon, UserFlightsTable } from '../../common/components';
import { APP_URL } from '../../common/constants';
import { useCopyToClipboard } from '../../common/hooks';
import { type TripsPageNavigationState } from './Trips';
import { useTripsPageStore } from './tripsPageStore';

export interface TripDisclosureProps {
  defaultOpen?: boolean;
  trip: UsersRouterOutput['getUserTrips']['upcomingTrips'][number];
}

export const TripDisclosure = ({
  defaultOpen,
  trip,
}: TripDisclosureProps): JSX.Element => {
  const copyToClipboard = useCopyToClipboard();
  const disclosureRef = useRef<HTMLDivElement>(null);
  const { state } = useLocation() as {
    state: TripsPageNavigationState | null;
  };
  const { tripId, username } = useParams();
  const { setActiveTrip, setIsDeleteDialogOpen } = useTripsPageStore();
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
                    `${APP_URL}${trip.link}`,
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
        className: 'btn-md sm:btn-lg',
        color: 'ghost',
      }}
      className={trip.inFuture ? 'bg-info/10' : 'bg-success/10'}
      defaultOpen={
        trip.id === tripId || trip.id === state?.tripId || defaultOpen
      }
      ref={disclosureRef}
      rounded
    >
      <UserFlightsTable
        data={trip.flights}
        dateBadgeColor={({ inFuture }) => (inFuture ? 'secondary' : 'ghost')}
        onCopyLink={({ link }) => {
          copyToClipboard(`${APP_URL}${link}`, 'Link copied to clipboard!');
        }}
        size="sm"
      />
    </Disclosure>
  );
};
