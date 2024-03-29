import { Modal } from 'stratosphere-ui';
import { useItineraryFlightsStore } from './itineraryFlightsStore';

export interface ResetItineraryModalProps {
  onSubmit?: () => void;
}

export const ResetItineraryModal = ({
  onSubmit,
}: ResetItineraryModalProps): JSX.Element => {
  const {
    isResetItineraryModalOpen,
    resetFlights,
    setIsResetItineraryModalOpen,
  } = useItineraryFlightsStore();
  const onClose = (): void => {
    setIsResetItineraryModalOpen(false);
  };
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          outline: true,
          onClick: onClose,
        },
        {
          children: 'Reset',
          color: 'primary',
          onClick: () => {
            resetFlights();
            onClose();
            onSubmit?.();
          },
        },
      ]}
      onClose={onClose}
      open={isResetItineraryModalOpen}
      title="Reset Itinerary"
    >
      <div className="pt-4">
        Are you sure you want to clear your entered flights?
      </div>
    </Modal>
  );
};
