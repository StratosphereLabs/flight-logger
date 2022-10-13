import { CredentialResponse } from '@react-oauth/google';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { upsertUser, verifyGoogleIdToken } from '../../utils';

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
    const user = await verifyGoogleIdToken(response.credential);
    if (user?.email === undefined) {
      return next(createHttpError(401, ''));
    }
    const token = await upsertUser({
      email: user.email,
      firstName: user?.given_name,
      lastName: user?.family_name,
    });
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};
