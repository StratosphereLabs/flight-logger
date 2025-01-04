import { TRPCError } from '@trpc/server';
import { type NextFunction, type RequestHandler, type Response } from 'express';
import { type Request as JwtRequest, expressjwt } from 'express-jwt';
import createHttpError from 'http-errors';

import { type UserToken } from '../../context';
import { middleware } from '../../trpc';

export const authorizeToken = (credentialsRequired?: boolean): RequestHandler =>
  expressjwt({
    secret: process.env.JWT_SECRET ?? '',
    algorithms: ['HS256'],
    credentialsRequired,
  });

export const verifyAdminRest = (
  req: JwtRequest<UserToken>,
  _: Response,
  next: NextFunction,
): void => {
  if (req.auth?.admin !== true) {
    next(createHttpError(401, 'Unauthorized'));
    return;
  }
  next();
};

export const verifyAuthenticated = middleware(async ({ ctx, next }) => {
  if (ctx.user === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return await next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const verifyAdminTRPC = middleware(async ({ ctx, next }) => {
  if (ctx.user?.admin !== true) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return await next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
