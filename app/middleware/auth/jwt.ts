import { user } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { middleware } from '../../trpc';

export const generateUserToken = (
  _: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = res.locals.user as user | undefined;
  if (user === undefined) {
    return next(
      createHttpError(401, 'Unable to generate token. Missing user data.'),
    );
  }
  if (process.env.JWT_SECRET === undefined) {
    return next(createHttpError(500, 'Missing JWT secret'));
  }
  const { id, username, admin }: UserToken = user;
  const token = jwt.sign({ id, username, admin }, process.env.JWT_SECRET);
  res.status(200).json({ token });
};

export const verifyAuthenticated = middleware(async ({ ctx, next }) => {
  if (ctx.user === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return await next({ ctx });
});

export const verifyAdmin = middleware(async ({ ctx, next }) => {
  if (ctx.user?.admin !== true) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return await next({ ctx });
});
