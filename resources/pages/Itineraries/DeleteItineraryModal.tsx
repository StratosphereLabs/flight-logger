import { useParams } from 'react-router-dom';
import { Modal } from 'stratosphere-ui';
import { useItinerariesPageStore } from './itinerariesPageStore';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const DeleteItineraryModal = (): JSX.Element => {
  const utils = trpc.useContext();
  const { username } = useParams();
  const { activeItinerary, isDeleteDialogOpen, setIsDeleteDialogOpen } =
    useItinerariesPageStore();
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } =
    trpc.itineraries.deleteItinerary.useMutation({
      onSuccess: ({ id }) => {
        handleSuccess('Itinerary Deleted');
        setIsDeleteDialogOpen(false);
        const previousItineraries = utils.users.getUserItineraries.getData({
          username,
        });
        utils.users.getUserItineraries.setData(
          { username },
          previousItineraries?.filter(itinerary => itinerary.id !== id),
        );
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
            activeItinerary !== null && mutate({ id: activeItinerary.id }),
        },
      ]}
      onClose={() => setIsDeleteDialogOpen(false)}
      open={isDeleteDialogOpen}
      title="Delete Itinerary"
    >
      Are you sure you want to delete{' '}
      <span className="font-bold">{activeItinerary?.name}</span>?
    </Modal>
  );
};