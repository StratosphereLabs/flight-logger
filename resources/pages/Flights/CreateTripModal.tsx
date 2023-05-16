import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, Modal } from 'stratosphere-ui';
import { useFlightsPageStore } from './flightsPageStore';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { createTripFormSchema } from '../../../app/schemas';

export interface CreateTripModalProps {
  onSuccess?: () => void;
}

export const CreateTripModal = ({
  onSuccess,
}: CreateTripModalProps): JSX.Element => {
  const { isCreateTripDialogOpen, rowSelection, setIsCreateTripDialogOpen } =
    useFlightsPageStore();
  const methods = useForm({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createTripFormSchema),
  });
  const flightIds = Object.keys(rowSelection);
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } = trpc.trips.createTrip.useMutation({
    onSuccess: () => {
      onSuccess?.();
      handleSuccess('Trip Created!');
      setIsCreateTripDialogOpen(false);
    },
  });
  useTRPCErrorHandler(error);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => setIsCreateTripDialogOpen(false),
        },
        {
          children: 'Create',
          color: 'primary',
          loading: isLoading,
          onClick: methods.handleSubmit(({ name }) =>
            mutate({ name, flightIds }),
          ),
        },
      ]}
      onClose={() => setIsCreateTripDialogOpen(false)}
      open={isCreateTripDialogOpen}
      title={`Create Trip (${flightIds.length} flights)`}
    >
      <Form className="flex flex-col gap-4" methods={methods}>
        <FormControl isRequired labelText="Trip Name" name="name" />
      </Form>
    </Modal>
  );
};
