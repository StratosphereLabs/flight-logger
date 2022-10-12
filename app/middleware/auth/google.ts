import { CredentialResponse } from '@react-oauth/google';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { verifyGoogleIdToken } from '../../auth';
import { CreateUserParams } from '../users';

export const verifyGoogleAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const response = req.body as CredentialResponse;
  if (response.credential === undefined) {
    return next(createHttpError(401, 'No credential provided'));
  }
  try {
    const token = await verifyGoogleIdToken(response.credential);
    const userParams: CreateUserParams = {
      email: token?.email,
      firstName: token?.given_name,
      lastName: token?.family_name,
    };
    res.locals.userParams = userParams;
    next();
  } catch (err) {
    next(err);
  }
};
