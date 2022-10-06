import { PaginatedQueryOptions } from './types';

export const getPaginationQueryString = ({
  pageIndex,
  pageSize,
}: PaginatedQueryOptions): string => {
  const page = pageIndex !== undefined ? pageIndex + 1 : 1;
  const limit = pageSize ?? 10;
  return `page=${page}&limit=${limit}`;
};
