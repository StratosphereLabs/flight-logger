import { useParams } from 'react-router-dom';
import { Modal } from 'stratosphere-ui';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { useItinerariesPageStore } from './itinerariesPageStore';

export const DeleteItineraryModal = (): JSX.Element => {
  const utils = trpc.useUtils();
  const { username } = useParams();
  const { activeItinerary, isDeleteDialogOpen, setIsDeleteDialogOpen } =
    useItinerariesPageStore();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.itineraries.deleteItinerary.useMutation({
    onSuccess: ({ id }) => {
      handleSuccess('Itinerary Deleted');
      setIsDeleteDialogOpen(false);
      utils.users.getUserItineraries.setData(
        { username },
        previousItineraries =>
          previousItineraries?.filter(itinerary => itinerary.id !== id),
      );
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
            activeItinerary !== null && mutate({ id: activeItinerary.id });
          },
        },
      ]}
      onClose={() => {
        setIsDeleteDialogOpen(false);
      }}
      open={isDeleteDialogOpen}
      title="Delete Itinerary"
    >
      <div className="pt-4">
        Are you sure you want to delete{' '}
        <span className="font-bold">{activeItinerary?.name}</span>?
      </div>
    </Modal>
  );
};
