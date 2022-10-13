import { user } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';

export type UserToken = Pick<user, 'id' | 'username' | 'admin'>;

export interface Context {
  [key: string]: unknown;
  user?: UserToken;
  origin?: string;
}

export const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions): Context => {
  const getUserFromHeader = (): UserToken | undefined => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== undefined) {
      const result = jwt.verify(
        token,
        process.env.JWT_SECRET ?? '',
      ) as UserToken;
      return result;
    }
  };
  return {
    user: getUserFromHeader(),
    origin: req.headers.origin,
  };
};
