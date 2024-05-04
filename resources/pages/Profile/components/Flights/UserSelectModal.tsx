import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Form, Modal } from 'stratosphere-ui';
import {
  type UserSelectFormData,
  selectUserSchema,
} from '../../../../../app/schemas';
import { UserSelect } from '../../../../common/components';

export interface UserSelectModalProps {
  isLoading: boolean;
  isOpen: boolean;
  onSubmit: SubmitHandler<UserSelectFormData>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const UserSelectModal = ({
  isLoading,
  isOpen,
  onSubmit,
  setIsOpen,
}: UserSelectModalProps): JSX.Element => {
  const methods = useForm<UserSelectFormData>({
    defaultValues: {
      username: null,
    },
    resolver: zodResolver(selectUserSchema),
  });
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        methods.setFocus('username');
      });
    }
  }, [isOpen, methods]);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => {
            setIsOpen(false);
          },
          outline: true,
        },
        {
          children: !isLoading ? 'Add Flight' : undefined,
          className: 'w-[125px]',
          color: 'primary',
          loading: isLoading,
          onClick: methods.handleSubmit(onSubmit),
        },
      ]}
      className="flex flex-col overflow-y-visible"
      onClose={() => {
        setIsOpen(false);
      }}
      open={isOpen}
      title="Select User"
    >
      <p className="py-4">Please select a user for this flight.</p>
      <Form className="flex flex-1" methods={methods}>
        <UserSelect
          className="w-[200px]"
          followingUsersOnly
          formValueMode="id"
          getBadgeText={({ username }) => username}
          inputClassName="bg-base-200"
          menuClassName="max-h-[200px] overflow-y-scroll w-[250px] bg-base-200"
          name="username"
          placeholder="Select..."
        />
      </Form>
    </Modal>
  );
};
