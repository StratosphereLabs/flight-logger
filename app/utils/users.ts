import { user } from '@prisma/client';
import { url } from 'gravatar';
import jwt from 'jsonwebtoken';
import { UserToken } from '../context';
import { prisma } from '../db';

export interface UpsertUserParams {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export const fetchGravatarUrl = (email: string): string =>
  url(email, { s: '200' }, true);

export const generateUserToken = (user: user): string => {
  const { id, username, admin }: UserToken = user;
  return jwt.sign({ id, username, admin }, process.env.JWT_SECRET as string);
};

export const upsertUser = async (params: UpsertUserParams): Promise<string> => {
  const user = await prisma.user.upsert({
    where: {
      email: params.email,
    },
    create: {
      email: params.email,
      username: params.username ?? params.email.split('@')[0],
      firstName: params.firstName ?? '',
      lastName: params.lastName ?? '',
      admin: false,
    },
    update: {},
  });
  return generateUserToken(user);
};
