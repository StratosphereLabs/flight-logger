import type { ErrorRequestHandler } from 'express';
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
  url(email, { s: '200' });

export const normalizePort = (val: string): string | number | undefined => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }
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
