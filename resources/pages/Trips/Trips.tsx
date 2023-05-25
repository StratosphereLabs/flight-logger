import { useEffect } from 'react';
import { Button, Progress } from 'react-daisyui';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Disclosure } from 'stratosphere-ui';
import { PlusIcon, TrashIcon, UserFlightsTable } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { FlightsPageNavigationState } from '../Flights';
import { DeleteTripModal } from './DeleteTripModal';
import { useTripsPageStore } from './tripsPageStore';

export interface TripsPageNavigationState {
  tripId: string | undefined;
}

export const Trips = (): JSX.Element => {
  const { state } = useLocation() as {
    state: TripsPageNavigationState | null;
  };
  const navigate = useNavigate();
  const { username } = useParams();
  const { setActiveTrip, setIsDeleteDialogOpen } = useTripsPageStore();
  const { data, error, isFetching } = trpc.users.getUserTrips.useQuery(
    {
      username,
    },
    {
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
    <div className="flex flex-col items-center gap-4">
      <article className="prose">
        <h2>{username !== undefined ? `${username}'s Trips` : 'My Trips'}</h2>
      </article>
      {isFetching ? (
        <Progress />
      ) : (
        <div className="flex w-full flex-1 flex-col gap-4">
          {data?.length === 0 ? (
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
          {data?.map(trip => (
            <Disclosure
              key={trip.id}
              buttonProps={{
                children: (
                  <div className="flex flex-1 items-center justify-between pr-2">
                    <span>{trip.name}</span>
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
                ),
                color: 'ghost',
                size: 'lg',
              }}
              defaultOpen={trip.id === state?.tripId}
              rounded
            >
              <UserFlightsTable data={trip.flights} />
            </Disclosure>
          ))}
        </div>
      )}
      <DeleteTripModal />
    </div>
  );
};
