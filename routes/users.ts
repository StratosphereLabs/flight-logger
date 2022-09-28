import express from 'express';
import { Request as JwtRequest, Request } from 'express-jwt';
import createHttpError from 'http-errors';
import multer from 'multer';
import { authorizeToken, UserToken, verifyAdmin } from '../app/auth';
import { prisma } from '../app/db';
import { saveFlightDiaryData } from '../app/parsers';
import {
  excludeKeys,
  fetchGravatarUrl,
  paginatedResults,
  paginateOptions,
} from '../app/utils';

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
        orderBy: [
          {
            outTime: 'desc',
          },
        ],
      });
      return res.status(200).json(flights);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:username/flights/upload/flightdiary',
  authorizeToken(true),
  verifyAdmin,
  upload.single('file'),
  async (req: Request<UserToken>, res, next) => {
    const { file } = req;
    const username = req.params.username;
    try {
      const flights = await saveFlightDiaryData(username, file);
      res.status(200).json(flights);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/',
  authorizeToken(true),
  verifyAdmin,
  paginateOptions,
  async (req, res, next) => {
    const {
      query: { limit },
      skip,
    } = req;
    try {
      const [results, itemCount] = await prisma.$transaction([
        prisma.user.findMany({
          skip,
          take: Number(limit),
        }),
        prisma.user.count(),
      ]);
      res.locals.results = results;
      res.locals.itemCount = itemCount;
      next();
    } catch (err) {
      next(err);
    }
  },
  paginatedResults,
);

export default router;
