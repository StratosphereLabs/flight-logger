import { type user } from '@prisma/client';
import { url } from 'gravatar';
import jwt from 'jsonwebtoken';
import { type UserToken } from '../context';

export type UserData = Omit<
  user,
  | 'id'
  | 'admin'
  | 'pushNotifications'
  | 'password'
  | 'passwordResetAt'
  | 'passwordResetToken'
>;

export const fetchGravatarUrl = (email: string): string =>
  url(email, { s: '200' }, true);

export const generateUserToken = ({
  id,
  username,
  admin,
}: UserToken): string | null => {
  const secret = process.env.JWT_SECRET;
  return secret !== undefined
    ? jwt.sign({ id, username, admin }, secret)
    : null;
};
