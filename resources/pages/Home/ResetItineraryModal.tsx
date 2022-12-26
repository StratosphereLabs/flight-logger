import { Modal, ModalProps } from '../../common/components';

export interface ResetItineraryModalProps
  extends Omit<ModalProps, 'actionButtons' | 'children' | 'onClose' | 'title'> {
  onCancel: () => void;
  onSubmit: () => void;
}

export const ResetItineraryModal = ({
  onCancel,
  onSubmit,
  ...props
}: ResetItineraryModalProps): JSX.Element => (
  <Modal
    actionButtons={[
      {
        children: 'Cancel',
        color: 'ghost',
        onClick: onCancel,
      },
      {
        children: 'Yes',
        color: 'error',
        initialFocus: true,
        onClick: onSubmit,
      },
    ]}
    onClose={onCancel}
    title="Reset Itinerary"
    {...props}
  >
    Are you sure you want to clear your entered flights?
  </Modal>
);
