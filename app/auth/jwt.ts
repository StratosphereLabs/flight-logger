import { user } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { expressjwt, Request as JwtRequest } from 'express-jwt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

export interface UserToken extends Pick<user, 'id' | 'username' | 'admin'> {}

export const authorizeToken = expressjwt({
  secret: process.env.JWT_SECRET ?? '',
  algorithms: ['HS256'],
});

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

export const verifyAdmin = (
  req: JwtRequest<UserToken>,
  _: Response,
  next: NextFunction,
): void => {
  if (req.auth?.admin !== true) {
    return next(createHttpError(401, 'Unauthenticated'));
  }
  next();
};
