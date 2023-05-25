import { useEffect } from 'react';
import { Button, Divider, Progress } from 'react-daisyui';
import { useNavigate, useParams } from 'react-router-dom';
import { UsersRouterOutput } from '../../../app/routes/users';
import { PlusIcon } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { FlightsPageNavigationState, ViewFlightModal } from '../Flights';
import { DeleteTripModal } from './DeleteTripModal';
import { TripDisclosure } from './TripDisclosure';

export interface TripsData {
  trips: UsersRouterOutput['getUserTrips'];
  upcomingTrips: UsersRouterOutput['getUserTrips'];
  total: number;
}

export interface TripsPageNavigationState {
  tripId: string | undefined;
}

export const Trips = (): JSX.Element => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUserTrips.useQuery(
    {
      username,
    },
    {
      select: trips =>
        trips.reduce(
          (acc: TripsData, trip) => {
            if (trip.inFuture) acc.upcomingTrips.push(trip);
            else acc.trips.push(trip);
            acc.total++;
            return acc;
          },
          {
            upcomingTrips: [],
            trips: [],
            total: 0,
          },
        ),
      staleTime: 5 * 60 * 1000,
    },
  );
  useEffect(() => {
    if (data !== undefined) {
      window.history.replaceState({}, document.title);
    }
  }, [data]);
  useTRPCErrorHandler(error);
  return (
    <div className="flex flex-col items-stretch gap-6">
      <article className="prose self-center">
        <h2>{username !== undefined ? `${username}'s Trips` : 'My Trips'}</h2>
      </article>
      {isFetching ? <Progress /> : null}
      {data !== undefined && data.total > 0 ? (
        <>
          {data.upcomingTrips.length > 0 ? (
            data.upcomingTrips.map(trip => (
              <TripDisclosure key={trip.id} trip={trip} />
            ))
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Upcoming Trips</p>
              </div>
            </div>
          )}
          <Divider />
          {data.trips.length > 0 ? (
            data.trips.map(trip => <TripDisclosure key={trip.id} trip={trip} />)
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Completed Trips</p>
              </div>
            </div>
          )}
        </>
      ) : null}
      {data?.total === 0 ? (
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="opacity-75">No Trips</p>
            {username === undefined ? (
              <Button
                color="primary"
                onClick={() =>
                  navigate('/flights', {
                    replace: false,
                    state: {
                      createTrip: true,
                    } as const as FlightsPageNavigationState,
                  })
                }
                startIcon={<PlusIcon className="h-6 w-6" />}
              >
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
