import { Modal } from 'stratosphere-ui';
import { useAccountPageStore } from './accountPageStore';

export interface WarningModalProps {
  isLoading: boolean;
  onConfirm: () => void;
}

export const WarningModal = ({
  isLoading,
  onConfirm,
}: WarningModalProps): JSX.Element => {
  const { isWarningDialogOpen, setIsWarningDialogOpen } = useAccountPageStore();
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          outline: true,
          onClick: () => {
            setIsWarningDialogOpen(false);
          },
        },
        {
          children: isLoading ? 'Uploading...' : 'Continue',
          color: 'primary',
          loading: isLoading,
          onClick: onConfirm,
        },
      ]}
      onClose={() => {
        setIsWarningDialogOpen(false);
      }}
      open={isWarningDialogOpen}
      title="Warning"
    >
      <div className="pt-4">
        All of your flights will be deleted and replaced with the ones inside
        the selected file. Are you sure you wish to continue?
      </div>
    </Modal>
  );
};
