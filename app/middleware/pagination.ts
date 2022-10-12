import { RequestHandler } from 'express';
import { middleware as paginate } from 'express-paginate';
import { getPageNumbers } from '../utils';

export const paginateOptions = paginate(10, 50);

export const paginatedResults: RequestHandler = (req, res) => {
  const {
    query: { limit, page },
  } = req;
  const results = res.locals.results as unknown[];
  const itemCount = res.locals.itemCount as number;
  const pageCount = Math.ceil(itemCount / Number(limit));
  const metadata = {
    page: Number(page),
    pageCount,
    limit: Number(limit),
    itemCount,
    pages: getPageNumbers(req, 3, pageCount, Number(page)),
  };
  res.status(200).json({ metadata, results });
};
