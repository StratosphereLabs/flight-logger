import { user } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';

type UserToken = Pick<user, 'id' | 'username' | 'admin'>;

export interface Context {
  [key: string]: unknown;
  user?: UserToken;
}

export const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions): Context => {
  const getUserFromHeader = (): UserToken | undefined => {
    if (req.headers.authorization !== undefined) {
      const token = req.headers.authorization.split(' ')[1];
      const result = jwt.verify(token, process.env.JWT_SECRET ?? '');
      console.log({ result });
      return undefined;
    }
  };
  return {
    user: getUserFromHeader(),
  };
};
