import { ErrorRequestHandler } from 'express';
import { HttpError } from 'http-errors';

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
