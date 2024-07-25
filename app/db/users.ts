import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { generateUserToken } from '../utils';

export interface UpsertUserParams {
  email: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
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
    },
    omit: {
      id: false,
      admin: false,
    },
    update: {},
  });
  return generateUserToken(user);
};
