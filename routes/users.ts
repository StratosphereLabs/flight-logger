import express from 'express';
import { Request as JwtRequest } from 'express-jwt';
import createHttpError from 'http-errors';
import { authorizeToken, UserToken, verifyAdmin } from '../app/auth';
import { prisma } from '../app/db';
import { excludeKeys, fetchGravatarUrl } from '../app/utils';

const router = express.Router();

router.get(
  '/profile',
  authorizeToken(true),
  async (req: JwtRequest<UserToken>, res, next) => {
    const username = req.auth?.username;
    try {
      const result = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (result === null) {
        throw createHttpError(404, 'User not found.');
      }
      res.status(200).json({
        avatar: fetchGravatarUrl(result.email),
        ...excludeKeys(
          result,
          'password',
          'id',
          'passwordResetToken',
          'passwordResetAt',
        ),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:username',
  authorizeToken(false),
  async (req: JwtRequest<UserToken>, res, next) => {
    const { username } = req.params;
    try {
      const result = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (result === null) {
        throw createHttpError(404, 'User not found');
      }
      return res.status(200).json({
        avatar: fetchGravatarUrl(result.email),
        ...excludeKeys(
          result,
          'password',
          'id',
          'passwordResetToken',
          'passwordResetAt',
        ),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:username/flights',
  authorizeToken(false),
  async (req: JwtRequest<UserToken>, res, next) => {
    const { username } = req.params;
    try {
      const flights = await prisma.flight.findMany({
        where: {
          user: {
            username,
          },
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
          aircraftType: true,
        },
      });
      return res.status(200).json(flights);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/', authorizeToken(true), verifyAdmin, async (_, res, next) => {
  try {
    const users = await prisma.user.findMany({});
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
