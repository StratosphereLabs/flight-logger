import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { useEffect } from 'react';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import {
  Form,
  FormRadioGroup,
  FormRadioGroupOption,
  Modal,
} from 'stratosphere-ui';

import {
  type UserSelectFormData,
  selectUserSchema,
} from '../../../../../app/schemas';
import { UserSelect } from '../../../../common/components';
import { useLoggedInUserQuery } from '../../../../common/hooks';
import { useAddFlightStore } from './addFlightStore';

export interface UserSelectModalProps {
  isLoading: boolean;
  onSubmit: SubmitHandler<UserSelectFormData>;
}

export const UserSelectModal = ({
  isLoading,
  onSubmit,
}: UserSelectModalProps): JSX.Element => {
  const { isUserSelectModalOpen, setIsUserSelectModalOpen } =
    useAddFlightStore();
  const { onOwnProfile } = useLoggedInUserQuery();
  const methods = useForm<UserSelectFormData>({
    defaultValues: {
      userType: 'me',
      username: null,
    } as unknown as UserSelectFormData,
    resolver: zodResolver(selectUserSchema),
  });
  const userType = useWatch<UserSelectFormData, 'userType'>({
    name: 'userType',
    control: methods.control,
  });
  useEffect(() => {
    if (userType === 'other' && isUserSelectModalOpen) {
      setTimeout(() => {
        methods.setFocus('username');
      });
    }
  }, [isUserSelectModalOpen, methods, userType]);
  useEffect(() => {
    methods.clearErrors('username');
  }, [methods, userType]);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => {
            setIsUserSelectModalOpen(false);
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
        setIsUserSelectModalOpen(false);
      }}
      open={isUserSelectModalOpen}
      title="Select User"
    >
      <p className="py-4">Please select a user for this flight.</p>
      <Form className="flex flex-1 flex-col gap-6" methods={methods}>
        {onOwnProfile ? (
          <FormRadioGroup className="w-full" name="userType">
            <FormRadioGroupOption
              activeColor="info"
              className="mr-[1px] flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
              value="me"
            >
              Myself
            </FormRadioGroupOption>
            <FormRadioGroupOption
              activeColor="info"
              className="flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
              value="other"
            >
              Other User
            </FormRadioGroupOption>
          </FormRadioGroup>
        ) : null}
        <UserSelect
          className={classNames(
            'w-[200px]',
            userType === 'me' && 'pointer-events-none opacity-60',
          )}
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
