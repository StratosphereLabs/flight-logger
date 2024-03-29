import { type user } from '@prisma/client';
import { url } from 'gravatar';
import jwt from 'jsonwebtoken';
import { type UserToken } from '../context';

export const fetchGravatarUrl = (email: string): string =>
  url(email, { s: '200' }, true);

export const generateUserToken = (user: user): string | null => {
  const { id, username, admin }: UserToken = user;
  const secret = process.env.JWT_SECRET;
  return secret !== undefined
    ? jwt.sign({ id, username, admin }, secret)
    : null;
};
