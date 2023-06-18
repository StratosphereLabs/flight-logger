import { type CredentialResponse } from '@react-oauth/google';
import { type NextFunction, type Request, type Response } from 'express';
import createHttpError from 'http-errors';
import { upsertUser } from '../../db';
import { verifyGoogleIdToken } from '../../utils';

export const verifyGoogleAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const response = req.body as CredentialResponse;
  if (response.credential === undefined) {
    next(createHttpError(401, 'No credential provided'));
    return;
  }
  try {
    const user = await verifyGoogleIdToken(response.credential);
    if (user?.email === undefined) {
      next(createHttpError(401, ''));
      return;
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
