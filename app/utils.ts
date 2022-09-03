import type { ErrorRequestHandler } from 'express';
import type { HttpError } from 'http-errors';

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
) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status ?? 500);
  res.render('error');
};
