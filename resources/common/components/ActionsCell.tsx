import { useMemo } from 'react';
import { ButtonArray, type ButtonOptions } from 'stratosphere-ui';
import { useLoggedInUserQuery } from '../hooks';
import { EditIcon, LinkIcon, TrashIcon, ViewIcon } from './Icons';

export interface ActionsCellProps {
  onCopyLink?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onView?: () => void;
  deleteMessage: string;
  editMessage: string;
  viewMessage: string;
}

export const ActionsCell = ({
  deleteMessage,
  editMessage,
  onCopyLink,
  onDelete,
  onEdit,
  onView,
  viewMessage,
}: ActionsCellProps): JSX.Element => {
  const { onOwnProfile } = useLoggedInUserQuery();
  const protectedOptions: ButtonOptions[] = useMemo(
    () => [
      {
        color: 'success',
        icon: EditIcon,
        key: 'edit',
        menuText: editMessage,
        onClick: () => onEdit?.(),
        size: 'xs',
      },
      {
        color: 'error',
        icon: TrashIcon,
        key: 'delete',
        menuText: deleteMessage,
        onClick: () => onDelete?.(),
        size: 'xs',
      },
    ],
    [deleteMessage, editMessage, onDelete, onEdit],
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
        ...(onOwnProfile ? protectedOptions : []),
      ]}
      collapseAt="xl"
      dropdownMenuProps={{
        menuClassName: 'rounded-xl w-48 right-0',
      }}
      withTooltips
    />
  );
};
