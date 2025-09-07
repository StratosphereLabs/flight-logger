import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import { type Dispatch, type SetStateAction, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Modal } from 'stratosphere-ui';

import {
  type AddTravelersFormData,
  addTravelersFormSchema,
} from '../../../app/schemas';
import { UserSelect } from '../../common/components';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AddTravelersModalProps {
  flightId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const AddTravelersModal = ({
  flightId,
  open,
  setOpen,
}: AddTravelersModalProps): JSX.Element => {
  const utils = trpc.useUtils();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const methods = useForm<AddTravelersFormData>({
    defaultValues: {
      usernames: [],
    },
    resolver: zodResolver(addTravelersFormSchema),
  });
  const { mutate, isLoading } = trpc.flights.addTravelersToFlight.useMutation({
    onSettled: () => {
      setOpen(false);
    },
    onSuccess: data => {
      handleSuccess(
        `Added @${data[0].username}${data.length > 1 ? ` and ${data.length - 1} other${data.length > 2 && 's'} to this flight` : ''}`,
      );
      utils.flights.getFlight.setData({ id: flightId }, previousData => ({
        ..._.omit(previousData, 'id'),
        id: flightId,
        otherTravelers:
          previousData !== undefined
            ? [...previousData.otherTravelers, ...data]
            : data,
      }));
    },
    onError,
  });
  const onSubmit = useCallback(
    (values: AddTravelersFormData) => {
      mutate({
        ...values,
        flightId,
      });
    },
    [flightId, mutate],
  );
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => {
            setOpen(false);
          },
          soft: true,
        },
        {
          children: !isLoading && 'Submit',
          className: 'w-[125px]',
          color: 'primary',
          disabled: isLoading,
          loading: isLoading,
          onClick: methods.handleSubmit(onSubmit),
          soft: true,
        },
      ]}
      className="overflow-y-visible"
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title="Add Travelers"
    >
      <Form className="mt-4" methods={methods}>
        <UserSelect
          bordered
          className="w-full"
          followingUsersOnly
          formValueMode="id"
          inputClassName="bg-base-200"
          max={5}
          menuClassName="max-h-[300px] overflow-y-scroll w-full bg-base-200 z-50"
          multi
          name="usernames"
          placeholder="Select..."
          withoutFlightId={flightId}
        />
      </Form>
    </Modal>
  );
};
