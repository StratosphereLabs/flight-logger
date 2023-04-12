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
} from '../common/components';

export interface ActionsCellProps {
  onCopyLink?: MouseEventHandler<HTMLElement>;
  onDeleteFlight?: MouseEventHandler<HTMLElement>;
  onEditFlight?: MouseEventHandler<HTMLElement>;
  onViewFlight?: MouseEventHandler<HTMLElement>;
}

export const ActionsCell = ({
  onCopyLink,
  onDeleteFlight,
  onEditFlight,
  onViewFlight,
}: ActionsCellProps): JSX.Element => {
  const { username } = useParams();
  return (
    <>
      <div className="hidden gap-1 xl:flex">
        <Button className="px-1" color="ghost" onClick={onCopyLink} size="xs">
          <LinkIcon />
          <span className="sr-only">Copy Link</span>
        </Button>
        <Button className="px-1" color="info" onClick={onViewFlight} size="xs">
          <ViewIcon className="h-4 w-4" />
          <span className="sr-only">View Flight</span>
        </Button>
        {username === undefined ? (
          <>
            <Button
              className="px-1"
              color="success"
              onClick={onEditFlight}
              size="xs"
            >
              <EditIcon />
              <span className="sr-only">Edit Flight</span>
            </Button>
            <Button
              className="px-1"
              color="error"
              onClick={onDeleteFlight}
              size="xs"
            >
              <TrashIcon />
              <span className="sr-only">Delete Flight</span>
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
              onClick: onViewFlight,
              children: (
                <>
                  <ViewIcon className="h-4 w-4" />
                  View Details
                </>
              ),
            },
            ...(username === undefined
              ? [
                  {
                    id: 'edit',
                    onClick: onEditFlight,
                    children: (
                      <>
                        <EditIcon />
                        Edit Flight
                      </>
                    ),
                  },
                  {
                    id: 'delete',
                    onClick: onDeleteFlight,
                    children: (
                      <>
                        <TrashIcon />
                        Delete Flight
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
