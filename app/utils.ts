import crypto from 'crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { middleware } from 'express-paginate';
import { url } from 'gravatar';
import type { HttpError } from 'http-errors';

export const excludeKeys = <Model, Key extends keyof Model>(
  model: Model,
  ...keys: Key[]
): Omit<Model, Key> => {
  for (const key of keys) {
    /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete */
    delete model[key];
  }
  return model;
};

export const fetchGravatarUrl = (email: string): string =>
  url(email, { s: '200' }, true);

export const normalizePort = (val: string): string | number | undefined => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }
};

export const getPasswordResetToken = (): string => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  return crypto.createHash('sha256').update(resetToken).digest('hex');
};

export const paginateOptions = middleware(10, 50);

export const getPageNumbers = (
  limit: number,
  pageCount: number,
  currentPage: number,
): Array<number | null> => [
  1,
  ...(currentPage > 3 ? [null] : []),
  ...[...Array(limit).keys()].flatMap(index => {
    const page = currentPage + index - 1;
    return page > 1 && page < pageCount ? [page] : [];
  }),
  ...(currentPage < pageCount - 2 ? [null] : []),
  pageCount,
];

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
    pages: getPageNumbers(3, pageCount, Number(page)),
  };
  res.status(200).json({ metadata, results });
};

export const errorRequestHandler: ErrorRequestHandler = (
  err: HttpError,
  req,
  res,
  next,
) => {
  const status = err.status ?? 500;
  res.status(status).json({
    status,
    message: err.message,
  });
};
