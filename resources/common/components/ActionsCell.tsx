import { type MouseEvent, useMemo } from 'react';
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
              onClick: ((e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onEdit?.();
              }) as () => void,
              size: 'xs',
              soft: true,
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
              onClick: ((e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onDelete?.();
              }) as () => void,
              size: 'xs',
              soft: true,
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
          icon: LinkIcon,
          key: 'copy-link',
          menuText: 'Copy Link',
          onClick: ((e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onCopyLink?.();
          }) as () => void,
          size: 'xs',
          soft: true,
        },
        {
          color: 'info',
          icon: ViewIcon,
          key: 'view',
          menuText: viewMessage,
          onClick: ((e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onView?.();
          }) as () => void,
          size: 'xs',
          soft: true,
        },
        ...protectedOptions,
      ]}
      collapseAt="xl"
      dropdownMenuProps={{
        anchor: 'bottom end',
        menuClassName: 'rounded-xl w-48 right-0 bg-base-200 z-50',
        buttonProps: {
          onClick: e => {
            e.stopPropagation();
          },
        },
      }}
      withTooltips
    />
  );
};
