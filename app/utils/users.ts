import { user } from '@prisma/client';
import { url } from 'gravatar';
import jwt from 'jsonwebtoken';
import { UserToken } from '../context';

export const fetchGravatarUrl = (email: string): string =>
  url(email, { s: '200' }, true);

export const generateUserToken = (user: user): string => {
  const { id, username, admin }: UserToken = user;
  return jwt.sign({ id, username, admin }, process.env.JWT_SECRET as string);
};
