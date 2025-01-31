import { Modal } from 'stratosphere-ui';

import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { useFlightsPageStore } from './flightsPageStore';

export const DeleteFlightModal = (): JSX.Element => {
  const utils = trpc.useUtils();
  const { activeFlight, isDeleteDialogOpen, setIsDeleteDialogOpen } =
    useFlightsPageStore();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.flights.deleteFlight.useMutation({
    onSuccess: () => {
      handleSuccess('Flight Deleted');
      setIsDeleteDialogOpen(false);
      void utils.flights.invalidate();
      void utils.users.invalidate();
      void utils.statistics.invalidate();
    },
    onError,
  });
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
            activeFlight !== null && mutate({ id: activeFlight.id });
          },
        },
      ]}
      onClose={() => {
        setIsDeleteDialogOpen(false);
      }}
      open={isDeleteDialogOpen}
      title="Delete Flight"
    >
      <div className="pt-4">
        Are you sure you want to delete your{' '}
        <strong>
          {activeFlight?.departureAirport.iata ?? ''} -{' '}
          {activeFlight?.arrivalAirport.iata ?? ''}
        </strong>{' '}
        flight?
      </div>
    </Modal>
  );
};
