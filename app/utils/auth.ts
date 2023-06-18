import crypto from 'crypto';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

export const TOKEN_SIZE = 32;

export const getPasswordResetToken = (): string => {
  const resetToken = crypto.randomBytes(TOKEN_SIZE).toString('hex');
  return crypto.createHash('sha256').update(resetToken).digest('hex');
};

export const verifyGoogleIdToken = async (
  token: string,
): Promise<TokenPayload | undefined> => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.VITE_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
};
