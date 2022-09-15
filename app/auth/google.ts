import { CredentialResponse } from '@react-oauth/google';
import { NextFunction, Request, Response } from 'express';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { CreateUserParams } from './utils';

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

const verifyGoogleIdToken = async (
  token: string,
): Promise<TokenPayload | undefined> => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.VITE_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
};

export const verifyGoogleAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const response = req.body as CredentialResponse;
  if (response.credential === undefined) {
    return next(new Error('No credential provided.'));
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
