import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from 'stratosphere-ui';
import { PlusIcon } from '../../common/components';
import { useProfilePage, useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { type FlightsPageNavigationState, ViewFlightModal } from '../Flights';
import { DeleteTripModal } from './DeleteTripModal';
import { TripDisclosure } from './TripDisclosure';

export interface TripsPageNavigationState {
  tripId: string | undefined;
}

export const Trips = (): JSX.Element => {
  const enabled = useProfilePage();
  const navigate = useNavigate();
  const { tripId, username } = useParams();
  const { state } = useLocation() as {
    state: TripsPageNavigationState | null;
  };
  const onError = useTRPCErrorHandler();
  const { data, isLoading } = trpc.users.getUserTrips.useQuery(
    {
      username,
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  useEffect(() => {
    if (data !== undefined) {
      window.history.replaceState({}, document.title);
    }
  }, [data]);
  return (
    <div className="flex flex-col items-stretch gap-6">
      <article className="prose self-center">
        <h2>{username !== undefined ? `${username}'s Trips` : 'My Trips'}</h2>
      </article>
      {isLoading ? (
        <div className="flex flex-1 justify-center pt-8">
          <span className="loading loading-spinner" />
        </div>
      ) : null}
      {!isLoading && data !== undefined && data.total > 0 ? (
        <>
          {data.upcomingTrips.length + data.currentTrips.length > 0 ? (
            [...data.currentTrips, ...data.upcomingTrips].map((trip, index) => (
              <TripDisclosure
                defaultOpen={
                  trip.id !== tripId && trip.id !== state?.tripId && index === 0
                }
                key={trip.id}
                trip={trip}
              />
            ))
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Upcoming Trips</p>
              </div>
            </div>
          )}
          <div className="divider my-2" />
          {data.completedTrips.length > 0 ? (
            data.completedTrips.map(trip => (
              <TripDisclosure key={trip.id} trip={trip} />
            ))
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Completed Trips</p>
              </div>
            </div>
          )}
        </>
      ) : null}
      {!isLoading && data?.total === 0 ? (
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="opacity-75">No Trips</p>
            {username === undefined ? (
              <Button
                color="primary"
                onClick={() => {
                  navigate('/flights', {
                    replace: false,
                    state: {
                      createTrip: true,
                    } as const as FlightsPageNavigationState,
                  });
                }}
              >
                <PlusIcon className="h-6 w-6" />
                Create Trip
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <DeleteTripModal />
      <ViewFlightModal />
    </div>
  );
};
