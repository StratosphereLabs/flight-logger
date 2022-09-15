import { NextFunction, Request, Response } from 'express';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export interface GoogleAuthPayload {
  credential: string;
  g_csrf_token: string;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyIdToken = async (
  token: string,
): Promise<TokenPayload | undefined> => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
};

export const verifyGoogleCsrfToken = (
  req: Request,
  _: Response,
  next: NextFunction,
): void => {
  const response = req.body as GoogleAuthPayload;
  const cookies = req.cookies as Record<string, string>;
  const csrfTokenCookie = cookies.g_csrf_token;
  if (csrfTokenCookie === undefined) {
    next(new Error('No CSRF token in Cookie'));
  }
  const googleCsrfToken = response.g_csrf_token;
  if (googleCsrfToken === undefined) {
    next(new Error('No CSRF token in post body'));
  }
  if (csrfTokenCookie !== googleCsrfToken) {
    next(new Error('Failed to verify double submit cookie'));
  }
  next();
};

export const verifyGoogleAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const response = req.body as GoogleAuthPayload;
  try {
    const token = await verifyIdToken(response.credential);
    if (token === undefined) {
      throw new Error('Unable to verify token');
    }
    res.locals.token = token;
    next();
  } catch (err) {
    next(err);
  }
};
