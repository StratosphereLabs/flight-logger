import { useParams } from 'react-router-dom';
import { Modal } from 'stratosphere-ui';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { useTripsPageStore } from './tripsPageStore';

export const DeleteTripModal = (): JSX.Element => {
  const utils = trpc.useUtils();
  const { username } = useParams();
  const { activeTrip, isDeleteDialogOpen, setIsDeleteDialogOpen } =
    useTripsPageStore();
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } = trpc.trips.deleteTrip.useMutation({
    onSuccess: async ({ id }) => {
      handleSuccess('Trip Deleted');
      setIsDeleteDialogOpen(false);
      utils.users.getUserTrips.setData({ username }, previousTrips =>
        previousTrips !== undefined
          ? {
              upcomingTrips: previousTrips.upcomingTrips.filter(
                trip => trip.id !== id,
              ),
              currentTrips: previousTrips.currentTrips.filter(
                trip => trip.id !== id,
              ),
              completedTrips: previousTrips.completedTrips.filter(
                trip => trip.id !== id,
              ),
              total: previousTrips.total - 1,
            }
          : undefined,
      );
      await utils.users.getUserFlights.invalidate();
    },
  });
  useTRPCErrorHandler(error);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          outline: true,
          onClick: () => {
            setIsDeleteDialogOpen(false);
          },
        },
        {
          children: 'Delete',
          color: 'primary',
          loading: isLoading,
          onClick: () => {
            activeTrip !== null && mutate({ id: activeTrip.id });
          },
        },
      ]}
      onClose={() => {
        setIsDeleteDialogOpen(false);
      }}
      open={isDeleteDialogOpen}
      title="Delete Trip"
    >
      <div className="pt-4">
        Are you sure you want to delete{' '}
        <span className="font-bold">{activeTrip?.name}</span>? This will not
        delete the flights associated with this trip.
      </div>
    </Modal>
  );
};
