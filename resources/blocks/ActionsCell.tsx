import { MouseEventHandler } from 'react';
import { Button, Dropdown } from 'react-daisyui';
import { useParams } from 'react-router-dom';
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
        <Button
          className="px-1"
          color="ghost"
          onClick={onCopyLink}
          startIcon={<LinkIcon />}
          size="xs"
        />
        <Button
          className="px-1"
          color="info"
          onClick={onViewFlight}
          startIcon={<ViewIcon className="h-4 w-4" />}
          size="xs"
        />
        {username === undefined ? (
          <>
            <Button
              className="px-1"
              color="success"
              onClick={onEditFlight}
              startIcon={<EditIcon />}
              size="xs"
            />
            <Button
              className="px-1"
              color="error"
              onClick={onDeleteFlight}
              startIcon={<TrashIcon />}
              size="xs"
            />
          </>
        ) : null}
      </div>
      <div className="flex xl:hidden">
        <Dropdown horizontal="center" vertical="end">
          <Button shape="circle" color="ghost" size="sm">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </Button>
          <Dropdown.Menu className="w-52">
            <Dropdown.Item onClick={onCopyLink}>
              <LinkIcon />
              Copy Link
            </Dropdown.Item>
            <Dropdown.Item onClick={onViewFlight}>
              <ViewIcon className="h-4 w-4" />
              View Details
            </Dropdown.Item>
            {username === undefined ? (
              <>
                <Dropdown.Item onClick={onEditFlight}>
                  <EditIcon />
                  Edit Flight
                </Dropdown.Item>
                <Dropdown.Item onClick={onDeleteFlight}>
                  <TrashIcon />
                  Delete Flight
                </Dropdown.Item>
              </>
            ) : null}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </>
  );
};
