import { useParams } from 'react-router-dom';
import { Modal, useAlertMessages } from 'stratosphere-ui';
import { useSuccessResponseHandler } from '../common/hooks';
import { trpc } from '../utils/trpc';
import { UsersRouterOutput } from '../../app/routes/users';

export interface DeleteFlightProps {
  data: UsersRouterOutput['getUserFlights'][number] | null;
  onClose: () => void;
  open: boolean;
}

export const DeleteFlightModal = ({
  data,
  onClose,
  open,
}: DeleteFlightProps): JSX.Element => {
  const utils = trpc.useContext();
  const { username } = useParams();
  const { addAlertMessages } = useAlertMessages();
  const handleSuccess = useSuccessResponseHandler();
  const { isLoading, mutate } = trpc.flights.deleteFlight.useMutation({
    onSuccess: ({ id }) => {
      handleSuccess('Flight Deleted');
      onClose();
      const previousFlights = utils.users.getUserFlights.getData({
        username,
      });
      utils.users.getUserFlights.setData(
        { username },
        previousFlights?.filter(flight => flight.id !== id),
      );
    },
    onError: err => {
      addAlertMessages([
        {
          status: 'error',
          message: err.message,
        },
      ]);
    },
  });
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'ghost',
          onClick: onClose,
        },
        {
          children: 'Yes',
          color: 'error',
          loading: isLoading,
          onClick: () => data !== null && mutate({ id: data.id }),
        },
      ]}
      onClose={onClose}
      open={open}
      title="Delete Flight"
    >
      Are you sure you want to delete your{' '}
      <strong>
        {data?.departureAirportId ?? ''} - {data?.arrivalAirportId ?? ''}
      </strong>{' '}
      flight?
    </Modal>
  );
};
