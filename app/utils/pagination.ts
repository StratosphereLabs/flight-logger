import { Request } from 'express';
import { getArrayPages } from 'express-paginate';

export const getPageNumbers = (
  req: Request,
  limit: number,
  pageCount: number,
  currentPage: number,
): Array<number | null> => {
  const pages = getArrayPages(req)(limit, pageCount, currentPage);
  return [
    1,
    ...(currentPage > 3 ? [null] : []),
    ...pages.flatMap(({ number }) =>
      number > 1 && number < pageCount ? [number] : [],
    ),
    ...(currentPage < pageCount - 2 ? [null] : []),
    pageCount,
  ];
};
