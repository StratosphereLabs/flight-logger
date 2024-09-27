import bcrypt from 'bcryptjs';
import { generateUserToken } from '../utils';
import { prisma } from './prisma';

export interface UpsertUserParams {
  email: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  githubId?: string;
  googleId?: string;
  twitterId?: string;
}

export const upsertUser = async (
  params: UpsertUserParams,
): Promise<string | null> => {
  const user = await prisma.user.upsert({
    where: {
      email: params.email,
    },
    create: {
      email: params.email,
      password:
        params.password !== undefined
          ? bcrypt.hashSync(params.password, 10)
          : null,
      username: params.username ?? params.email.split('@')[0],
      firstName: params.firstName ?? '',
      lastName: params.lastName ?? '',
      admin: false,
      githubId: params.githubId ?? '',
      googleId: params.googleId ?? '',
      twitterId: params.twitterId ?? '',
    },
    omit: {
      id: false,
      admin: false,
    },
    update: {},
  });
  return generateUserToken(user);
};
