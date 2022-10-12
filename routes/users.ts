import express from 'express';
import createHttpError from 'http-errors';
import multer from 'multer';
import { prisma } from '../app/db';
import {
  authorizeToken,
  paginatedResults,
  paginateOptions,
  UserToken,
  verifyAdmin,
  verifyUsername,
} from '../app/middleware';
import { getAirports, getRoutes, saveFlightDiaryData } from '../app/parsers';
import { addFlightSchema } from '../app/schemas';
import { excludeKeys, fetchGravatarUrl } from '../app/utils';
import { AddFlightRequest } from '../resources/common/hooks';

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

router.get(
  '/:username/flight-map',
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
        },
      });
      const airports = getAirports(flights);
      const routes = getRoutes(flights);
      return res.status(200).json({
        airports,
        routes,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:username/flights',
  authorizeToken(true),
  verifyUsername,
  async (req: Request<UserToken>, res, next) => {
    const body = req.body as AddFlightRequest;
    try {
      await addFlightSchema.parseAsync(body);
      const flight = await prisma.flight.create({
        data: {
          user: {
            connect: {
              id: req.auth?.id,
            },
          },
          departureAirport: {
            connect: {
              id: body.departureAirportId,
            },
          },
          arrivalAirport: {
            connect: {
              id: body.arrivalAirportId,
            },
          },
          airline:
            body.airlineId !== null && body.airlineId !== ''
              ? {
                  connect: {
                    id: body.airlineId,
                  },
                }
              : undefined,
          aircraftType:
            body.aircraftTypeId !== null && body.aircraftTypeId !== ''
              ? {
                  connect: {
                    id: body.aircraftTypeId,
                  },
                }
              : undefined,
          flightNumber: Number(body.flightNumber),
          callsign: body.callsign,
          tailNumber: body.tailNumber,
          outTime: `${body.outDate} ${body.outTime ?? ''}`.trim(),
          offTime: body.offTime,
          onTime: body.inTime,
          inTime: body.inTime,
          class: body.class,
          seatNumber: body.seatNumber,
          seatPosition: body.seatPosition,
          reason: body.reason,
          comments: body.comments,
          trackingLink: body.trackingLink,
        },
      });
      res.status(200).json(flight);
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
