import { Modal } from 'stratosphere-ui';
import { useMemo } from 'react';
import { useItineraryFlightsStore } from './itineraryFlightsStore';

export const DeleteItineraryModal = (): JSX.Element => {
  const {
    deleteFlight,
    deleteFlightId,
    flights,
    isDeleteItineraryModalOpen,
    setIsDeleteItineraryModalOpen,
  } = useItineraryFlightsStore();
  const flight = useMemo(
    () => flights.find(({ id }) => id === deleteFlightId),
    [deleteFlightId, flights],
  );
  const onClose = (): void => {
    setIsDeleteItineraryModalOpen(false);
  };
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          onClick: onClose,
        },
        {
          children: 'Delete',
          color: 'primary',
          onClick: () => {
            if (flight !== undefined) deleteFlight(flight.id);
            onClose();
          },
        },
      ]}
      onClose={onClose}
      open={isDeleteItineraryModalOpen}
      title="Delete Flight"
    >
      Are you sure you want to delete your{' '}
      <strong>
        {flight?.departureAirport?.id ?? ''} -{' '}
        {flight?.arrivalAirport?.id ?? ''}
      </strong>{' '}
      flight?
    </Modal>
  );
};
