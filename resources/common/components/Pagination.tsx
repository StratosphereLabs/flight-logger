import { Button, Pagination as DaisyUIPagination } from 'react-daisyui';
import { PaginationMetadata } from '../types';

export interface PaginationProps {
  metadata?: PaginationMetadata;
  onPaginationChange: (page: number) => void;
  size?: 'lg' | 'md' | 'sm' | 'xs' | undefined;
}

export const Pagination = ({
  metadata,
  onPaginationChange,
  size,
}: PaginationProps): JSX.Element | null =>
  metadata !== undefined ? (
    <DaisyUIPagination className="mt-3">
      {metadata?.pages.map((number, index) => (
        <Button
          key={index}
          active={number === metadata.page}
          onClick={
            number !== null ? () => onPaginationChange(number) : undefined
          }
          disabled={number === null}
          size={size}
        >
          {number ?? '...'}
        </Button>
      ))}
    </DaisyUIPagination>
  ) : null;
