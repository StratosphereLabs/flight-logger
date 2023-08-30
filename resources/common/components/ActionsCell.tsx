import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ButtonArray, type ButtonOptions } from 'stratosphere-ui';
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
  const { username } = useParams();
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
        key: 'edit',
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
        ...(username === undefined ? protectedOptions : []),
      ]}
      collapseAt="xl"
      withTooltips
    />
  );
};
