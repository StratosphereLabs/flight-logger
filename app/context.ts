import { type user } from '@prisma/client';
import type * as trpcExpress from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';

export type UserToken = Pick<user, 'id' | 'username' | 'admin'>;

export interface Context {
  user: UserToken | null;
  origin?: string;
}

export const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions): Context => {
  const getUserFromHeader = (): UserToken | null => {
    if (req.headers.authorization !== undefined) {
      const user = jwt.verify(
        req.headers.authorization.split(' ')[1],
        process.env.JWT_SECRET ?? '',
      ) as UserToken;
      return user;
    }
    return null;
  };
  return {
    user: getUserFromHeader(),
    origin: req.headers.origin,
  };
};
