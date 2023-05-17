import { Progress } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { Disclosure } from 'stratosphere-ui';
import { DeleteTripModal } from './DeleteTripModal';
import { useTripsPageStore } from './tripsPageStore';
import { TrashIcon, UserFlightsTable } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const Trips = (): JSX.Element => {
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
