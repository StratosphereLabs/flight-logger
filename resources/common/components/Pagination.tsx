import classNames from 'classnames';
import {
  Button,
  Pagination as DaisyUIPagination,
  PaginationProps as DaisyUIPaginationProps,
} from 'react-daisyui';
import { PaginationMetadata } from '../types';

export interface PaginationProps
  extends Omit<DaisyUIPaginationProps, 'children'> {
  metadata?: PaginationMetadata;
  onPaginationChange: (page: number) => void;
  size?: 'lg' | 'md' | 'sm' | 'xs' | undefined;
}

export const Pagination = ({
  className,
  metadata,
  onPaginationChange,
  size,
  ...props
}: PaginationProps): JSX.Element | null =>
  metadata !== undefined ? (
    <DaisyUIPagination className={classNames('mt-4', className)} {...props}>
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
