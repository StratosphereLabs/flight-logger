import { NextFunction, Request, Response } from 'express';
import { prisma } from '../db';

export interface CreateUserParams {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const upsertUser = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const params = res.locals.userParams as CreateUserParams;
  if (params.email === undefined) {
    return next(
      new Error('No email found. Please choose another authentication method'),
    );
  }
  try {
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
    res.locals.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
