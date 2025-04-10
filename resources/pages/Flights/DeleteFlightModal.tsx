import { Modal } from 'stratosphere-ui';

import {
  useLoggedInUserQuery,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { useFlightsPageStore } from './flightsPageStore';

export const DeleteFlightModal = (): JSX.Element => {
  const utils = trpc.useUtils();
  const { data } = useLoggedInUserQuery();
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
          onClick: () => {
            setIsDeleteDialogOpen(false);
          },
          soft: true,
        },
        {
          children: 'Delete',
          color: 'primary',
          loading: isLoading,
          onClick: () => {
            activeFlight !== null && mutate({ id: activeFlight.id });
          },
          soft: true,
        },
      ]}
      onClose={() => {
        setIsDeleteDialogOpen(false);
      }}
      open={isDeleteDialogOpen}
      title="Delete Flight"
    >
      <div className="pt-4">
        Are you sure you want to delete{' '}
        {activeFlight?.userId !== data?.id ? (
          <>
            <strong>{activeFlight?.user.username}</strong>&apos;s
          </>
        ) : (
          'your'
        )}{' '}
        <strong>
          {activeFlight?.departureAirport.iata ?? ''} -{' '}
          {activeFlight?.arrivalAirport.iata ?? ''}
        </strong>{' '}
        flight?
      </div>
    </Modal>
  );
};
