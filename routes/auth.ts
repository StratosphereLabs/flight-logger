import bcrypt from 'bcryptjs';
import express from 'express';
import createHttpError from 'http-errors';
import {
  generateUserToken,
  upsertUser,
  verifyGoogleAuthToken,
  verifyPassword,
} from '../app/auth';
import { prisma } from '../app/db';
import { sendEmail } from '../app/email';
import { getResetEmail } from '../app/getResetEmail';
import { getPasswordResetToken } from '../app/utils';
import {
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../resources/common/hooks';

const router = express.Router();

router.post('/login', verifyPassword, generateUserToken);

router.post(
  '/google/authenticate',
  verifyGoogleAuthToken,
  upsertUser,
  generateUserToken,
);

router.post('/forgot-password', async (req, res, next) => {
  const body = req.body as ForgotPasswordRequest;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (user === null) {
      return next(
        createHttpError(
          401,
          'No user with that email address found. Please create a new account.',
        ),
      );
    }
    const passwordResetToken = getPasswordResetToken();
    await prisma.user.update({
      where: {
        email: body.email,
      },
      data: {
        passwordResetToken,
        passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await sendEmail({
      address: body.email,
      subject: 'Reset your password',
      html: getResetEmail({
        resetLink: `${
          req.headers.origin ?? ''
        }/auth/reset-password/${passwordResetToken}`,
      }),
    });
    res.sendStatus(200);
  } catch (err) {
    await prisma.user.update({
      where: {
        email: body.email,
      },
      data: {
        passwordResetAt: null,
        passwordResetToken: null,
      },
    });
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  const body = req.body as ResetPasswordRequest;
  if (body.password !== body.confirmPassword) {
    return next(createHttpError(401, 'Passwords do not match.'));
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: body.token,
        passwordResetAt: {
          gt: new Date(),
        },
      },
    });
    if (user === null) {
      throw createHttpError(401, 'Invalid token');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetAt: null,
      },
    });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
