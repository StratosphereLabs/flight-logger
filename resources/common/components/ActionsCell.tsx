import { MouseEventHandler } from 'react';
import { Button } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { DropdownMenu } from 'stratosphere-ui';
import {
  EditIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  TrashIcon,
  ViewIcon,
} from './Icons';

export interface ActionsCellProps {
  onCopyLink?: MouseEventHandler<HTMLElement>;
  onDelete?: MouseEventHandler<HTMLElement>;
  onEdit?: MouseEventHandler<HTMLElement>;
  onView?: MouseEventHandler<HTMLElement>;
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
  return (
    <>
      <div className="hidden gap-1 xl:flex">
        <Button className="px-1" color="ghost" onClick={onCopyLink} size="xs">
          <LinkIcon />
          <span className="sr-only">Copy Link</span>
        </Button>
        <Button className="px-1" color="info" onClick={onView} size="xs">
          <ViewIcon className="h-4 w-4" />
          <span className="sr-only">{viewMessage}</span>
        </Button>
        {username === undefined ? (
          <>
            <Button className="px-1" color="success" onClick={onEdit} size="xs">
              <EditIcon />
              <span className="sr-only">{editMessage}</span>
            </Button>
            <Button className="px-1" color="error" onClick={onDelete} size="xs">
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">{deleteMessage}</span>
            </Button>
          </>
        ) : null}
      </div>
      <div className="flex xl:hidden">
        <DropdownMenu
          buttonProps={{
            shape: 'circle',
            color: 'ghost',
            size: 'sm',
            children: (
              <>
                <EllipsisVerticalIcon className="h-5 w-5" />
                <span className="sr-only">Actions Menu</span>
              </>
            ),
          }}
          items={[
            {
              id: 'copy',
              onClick: onCopyLink,
              children: (
                <>
                  <LinkIcon />
                  Copy Link
                </>
              ),
            },
            {
              id: 'view',
              onClick: onView,
              children: (
                <>
                  <ViewIcon className="h-4 w-4" />
                  {viewMessage}
                </>
              ),
            },
            ...(username === undefined
              ? [
                  {
                    id: 'edit',
                    onClick: onEdit,
                    children: (
                      <>
                        <EditIcon />
                        {editMessage}
                      </>
                    ),
                  },
                  {
                    id: 'delete',
                    onClick: onDelete,
                    children: (
                      <>
                        <TrashIcon className="h-4 w-4" />
                        {deleteMessage}
                      </>
                    ),
                  },
                ]
              : []),
          ]}
          menuClassName="rounded-box p-2 w-48 right-0"
        />
      </div>
    </>
  );
};
