import { PaginationRequest } from '../schemas';

export interface PaginationData {
  skip: number;
  take: number;
  limit: number;
  page: number;
}

export interface PaginatedResultsOptions<DataItem> {
  results: DataItem[];
  itemCount: number;
  limit: number;
  page: number;
}

export interface PaginatedResponse<DataItem> {
  metadata: {
    page: number;
    pageCount: number;
    limit: number;
    itemCount: number;
    pages: Array<number | null>;
  };
  results: DataItem[];
}

export const parsePaginationRequest = ({
  page: currentPage,
  limit,
}: PaginationRequest): PaginationData => {
  const page = currentPage ?? 1;
  const take = limit ?? 10;
  return {
    limit: take,
    page,
    take,
    skip: take * (page - 1),
  };
};

export const getPageNumbers = (
  limit: number,
  pageCount: number,
  currentPage: number,
): Array<number | null> => [
  1,
  ...(currentPage > 3 ? [null] : []),
  ...[...Array(3).keys()].flatMap(index => {
    const page = currentPage + index - 1;
    return page > 1 && page < pageCount ? [page] : [];
  }),
  ...(currentPage < pageCount - 2 ? [null] : []),
  pageCount,
];

export const getPaginatedResponse = <DataItem>({
  itemCount,
  limit,
  page,
  results,
}: PaginatedResultsOptions<DataItem>): PaginatedResponse<DataItem> => {
  const pageCount = Math.ceil(itemCount / Number(limit));
  const metadata = {
    page,
    pageCount,
    limit,
    itemCount,
    pages: getPageNumbers(3, pageCount, Number(page)),
  };
  return { metadata, results };
};
