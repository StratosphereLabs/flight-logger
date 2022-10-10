import { PaginationState, SortingState } from '@tanstack/react-table';

export const getPaginationQueryString = ({
  pageIndex,
  pageSize,
}: PaginationState): string => {
  const page = pageIndex !== undefined ? pageIndex + 1 : 1;
  const limit = pageSize ?? 10;
  return `page=${page}&limit=${limit}`;
};

export const getSortingQueryString = (sorting: SortingState): string =>
  sorting.length > 0
    ? `sortKey=${sorting[0].id ?? ''}&sort=${sorting[0].desc ? 'desc' : 'asc'}`
    : '';
