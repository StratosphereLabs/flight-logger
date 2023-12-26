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
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== undefined) {
      const user = jwt.verify(token, process.env.JWT_SECRET ?? '') as UserToken;
      return user;
    }
    return null;
  };
  return {
    user: getUserFromHeader(),
    origin: req.headers.origin,
  };
};
