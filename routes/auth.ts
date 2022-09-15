import express from 'express';
import { TokenPayload } from 'google-auth-library';
import { verifyGoogleAuthToken, verifyGoogleCsrfToken } from '../app/auth';
import { prisma } from '../app/db';

const router = express.Router();

router.post(
  '/google/callback',
  verifyGoogleCsrfToken,
  verifyGoogleAuthToken,
  async (_, res, next) => {
    const token = res.locals.token as TokenPayload;
    if (token.name === undefined) {
      return next(new Error('Missing username'));
    }
    if (token.email === undefined) {
      return next(new Error('Missing email'));
    }
    const user = await prisma.user.upsert({
      where: {
        email: token.email,
      },
      create: {
        username: token.name,
        email: token.email,
        firstName: token.given_name ?? '',
        lastName: token.family_name ?? '',
      },
      update: {},
    });
    res.status(200).json(user);
  },
);

export default router;
