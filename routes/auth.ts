import bcrypt from 'bcryptjs';
import express from 'express';
import {
  generateUserToken,
  upsertUser,
  verifyGoogleAuthToken,
} from '../app/auth';
import { prisma } from '../app/db';
import { LoginRequest } from '../resources/pages/Login/useLoginMutation';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const body = req.body as LoginRequest;
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: body.email,
      },
    });
    if (user.password === null) {
      throw new Error(
        'No password stored. Please reset your password to create a new one.',
      );
    }
    const matching = await bcrypt.compare(body.password, user.password);
    if (!matching) {
      throw new Error('Incorrect Password');
    }
    res.locals.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

router.post(
  '/google/callback',
  verifyGoogleAuthToken,
  upsertUser,
  generateUserToken,
);

export default router;
