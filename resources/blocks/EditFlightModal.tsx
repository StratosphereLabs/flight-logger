import { useParams } from 'react-router-dom';
import { Modal, useAlertMessages } from 'stratosphere-ui';
import { useSuccessResponseHandler } from '../common/hooks';
import { trpc } from '../utils/trpc';

export interface EditFlightProps {
  data: Record<string, unknown> | null;
  onClose: () => void;
  show: boolean;
}

export const EditFlightModal = ({
  data,
  onClose,
  show,
}: EditFlightProps): JSX.Element => {
  const utils = trpc.useContext();
  const { username } = useParams();
  const { addAlertMessages } = useAlertMessages();
  const handleSuccess = useSuccessResponseHandler();
  const { isLoading, mutate } = trpc.flights.editFlight.useMutation({
    onSuccess: ({ id }) => {
      handleSuccess('Flight Edited!');
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
          children: 'Save',
          color: 'success',
          loading: isLoading,
          onClick: () => mutate({}),
        },
      ]}
      onClose={onClose}
      show={show}
      title="Edit Flight"
    >
      Edit Flight
    </Modal>
  );
};
