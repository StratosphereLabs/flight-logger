import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { LoginRequest } from '../../resources/common/hooks';
import { prisma } from '../db';

export const verifyPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const body = req.body as LoginRequest;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email.toLowerCase(),
      },
    });
    if (user === null) {
      throw createHttpError(
        401,
        'No user with that email address found. Please create a new account.',
      );
    }
    if (user.password === null) {
      throw createHttpError(
        401,
        'No password stored. Please reset your password to create a new one.',
      );
    }
    const matching = await bcrypt.compare(body.password, user.password);
    if (!matching) {
      throw createHttpError(401, 'Incorrect Password');
    }
    res.locals.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
