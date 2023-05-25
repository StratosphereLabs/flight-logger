import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, Modal } from 'stratosphere-ui';
import { createTripFormSchema } from '../../../app/schemas';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { useFlightsPageStore } from './flightsPageStore';

export interface CreateTripModalProps {
  onSuccess?: (tripId: string) => void;
}

export const CreateTripModal = ({
  onSuccess,
}: CreateTripModalProps): JSX.Element => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const utils = trpc.useContext();
  const { isCreateTripDialogOpen, rowSelection, setIsCreateTripDialogOpen } =
    useFlightsPageStore();
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      tripName: '',
    },
    resolver: zodResolver(createTripFormSchema),
  });
  const flightIds = Object.keys(rowSelection);
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } = trpc.trips.createTrip.useMutation({
    onSuccess: async data => {
      handleSuccess('Trip Created!');
      setIsCreateTripDialogOpen(false);
      onSuccess?.(data.id);
      await utils.users.invalidate();
    },
  });
  useEffect(() => {
    if (isCreateTripDialogOpen) {
      setTimeout(() => methods.setFocus('tripName'), 100);
    }
  }, [isCreateTripDialogOpen]);
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
          onClick: methods.handleSubmit(({ tripName }) =>
            mutate({ name: tripName, flightIds }),
          ),
        },
      ]}
      onClose={() => setIsCreateTripDialogOpen(false)}
      open={isCreateTripDialogOpen}
      ref={modalRef}
      title={`Create Trip (${flightIds.length} flights)`}
    >
      <Form className="flex flex-col gap-4" methods={methods}>
        <FormControl isRequired labelText="Trip Name" name="tripName" />
      </Form>
    </Modal>
  );
};
