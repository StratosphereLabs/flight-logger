import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Badge, Disclosure } from 'stratosphere-ui';

import { type TripsRouterOutput } from '../../../app/routes/trips';
import { LinkIcon, TrashIcon, UserFlightsTable } from '../../common/components';
import { APP_URL } from '../../common/constants';
import { useCopyToClipboard, useLoggedInUserQuery } from '../../common/hooks';
import { type TripsPageNavigationState } from './Trips';
import { useTripsPageStore } from './tripsPageStore';

export interface TripDisclosureProps {
  defaultOpen?: boolean;
  trip: TripsRouterOutput['getUserTrips']['upcomingTrips'][number];
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
  const { tripId } = useParams();
  const { onOwnProfile } = useLoggedInUserQuery();
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
              className="badge-sm md:badge-md font-normal md:font-semibold"
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
                className="btn btn-circle btn-ghost btn-sm sm:btn-md"
                onClick={event => {
                  event.stopPropagation();
                  copyToClipboard(
                    `${APP_URL}${trip.link}`,
                    'Link copied to clipboard!',
                  );
                }}
              >
                <LinkIcon className="h-5 w-5" />
                <span className="sr-only">Copy Link</span>
              </a>
              {onOwnProfile ? (
                <a
                  className="btn btn-circle btn-ghost btn-sm sm:btn-md"
                  onClick={event => {
                    event.stopPropagation();
                    setActiveTrip(trip);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <TrashIcon className="h-5 w-5" />
                  <span className="sr-only">Delete Trip</span>
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
        className="table-xs sm:table-sm"
        data={trip.flights}
        dateBadgeColor={({ outDateISO }) =>
          outDateISO.split('-')[0] === new Date().getFullYear().toString()
            ? 'info'
            : 'secondary'
        }
        onCopyLink={({ link }) => {
          copyToClipboard(`${APP_URL}${link}`, 'Link copied to clipboard!');
        }}
      />
    </Disclosure>
  );
};
