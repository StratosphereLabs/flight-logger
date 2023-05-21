import { useParams } from 'react-router-dom';
import { Modal } from 'stratosphere-ui';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { useFlightsPageStore } from './flightsPageStore';

export const DeleteFlightModal = (): JSX.Element => {
  const utils = trpc.useContext();
  const { username } = useParams();
  const { activeFlight, isDeleteDialogOpen, setIsDeleteDialogOpen } =
    useFlightsPageStore();
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } = trpc.flights.deleteFlight.useMutation({
    onSuccess: async ({ id }) => {
      handleSuccess('Flight Deleted');
      setIsDeleteDialogOpen(false);
      const previousFlights = utils.users.getUserFlights.getData({
        username,
      });
      utils.users.getUserFlights.setData(
        { username },
        previousFlights?.filter(flight => flight.id !== id),
      );
      await utils.users.getUserTrips.invalidate();
    },
  });
  useTRPCErrorHandler(error);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => setIsDeleteDialogOpen(false),
        },
        {
          children: 'Delete',
          color: 'primary',
          loading: isLoading,
          onClick: () =>
            activeFlight !== null && mutate({ id: activeFlight.id }),
        },
      ]}
      onClose={() => setIsDeleteDialogOpen(false)}
      open={isDeleteDialogOpen}
      title="Delete Flight"
    >
      Are you sure you want to delete your{' '}
      <strong>
        {activeFlight?.departureAirportId ?? ''} -{' '}
        {activeFlight?.arrivalAirportId ?? ''}
      </strong>{' '}
      flight?
    </Modal>
  );
};
