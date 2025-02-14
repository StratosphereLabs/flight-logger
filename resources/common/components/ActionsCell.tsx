import { useMemo } from 'react';
import { ButtonArray, type ButtonOptions } from 'stratosphere-ui';

import { useLoggedInUserQuery } from '../hooks';
import { EditIcon, LinkIcon, TrashIcon, ViewIcon } from './Icons';
import { type FlightsTableRow } from './UserFlightsTable';

export interface ActionsCellProps {
  onCopyLink?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onView?: () => void;
  data: FlightsTableRow['original'];
  deleteMessage: string;
  editMessage: string;
  viewMessage: string;
}

export const ActionsCell = ({
  data,
  deleteMessage,
  editMessage,
  onCopyLink,
  onDelete,
  onEdit,
  onView,
  viewMessage,
}: ActionsCellProps): JSX.Element => {
  const { data: userData, onOwnProfile } = useLoggedInUserQuery();
  const isAddedByUser = userData?.id === data.addedByUserId;
  const protectedOptions: ButtonOptions[] = useMemo(
    () => [
      ...(onOwnProfile
        ? [
            {
              color: 'success',
              icon: EditIcon,
              key: 'edit',
              menuText: editMessage,
              onClick: () => onEdit?.(),
              size: 'xs',
            } as const,
          ]
        : []),
      ...(onOwnProfile || isAddedByUser
        ? [
            {
              color: 'error',
              icon: TrashIcon,
              key: 'delete',
              menuText: deleteMessage,
              onClick: () => onDelete?.(),
              size: 'xs',
            } as const,
          ]
        : []),
    ],
    [deleteMessage, editMessage, isAddedByUser, onDelete, onEdit, onOwnProfile],
  );
  return (
    <ButtonArray
      buttonOptions={[
        {
          color: 'ghost',
          icon: LinkIcon,
          key: 'copy-link',
          menuText: 'Copy Link',
          onClick: () => onCopyLink?.(),
          size: 'xs',
        },
        {
          color: 'info',
          icon: ViewIcon,
          key: 'view',
          menuText: viewMessage,
          onClick: () => onView?.(),
          size: 'xs',
        },
        ...protectedOptions,
      ]}
      collapseAt="xl"
      dropdownMenuProps={{
        menuClassName: 'rounded-xl w-48 right-0',
      }}
      withTooltips
    />
  );
};
