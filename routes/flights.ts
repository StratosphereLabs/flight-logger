import express from 'express';
import { Request } from 'express-jwt';
import createHttpError from 'http-errors';
import multer from 'multer';
import { authorizeToken, UserToken, verifyAdmin } from '../app/auth';
import { prisma } from '../app/db';
import { saveFlightDiaryData } from '../app/parsers';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get('/', async (_, res, next) => {
  try {
    const response = await prisma.flight.findMany({
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
        aircraftType: true,
      },
    });
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const flight = await prisma.flight.findUnique({
      where: {
        id,
      },
    });
    if (flight === null) {
      throw createHttpError(404, 'Flight not found.');
    }
    return res.status(200).json(flight);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/upload/flightdiary',
  authorizeToken(true),
  upload.single('file'),
  async (req: Request<UserToken>, res, next) => {
    const { file } = req;
    const username = req.auth?.username;
    if (username === undefined) {
      return next(createHttpError(401, 'Unable to authenticate'));
    }
    try {
      const flights = await saveFlightDiaryData(username, file);
      res.status(200).json(flights);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/upload/flightdiary/:username',
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

// TODO: Remove in production
router.delete(
  '/',
  authorizeToken(true),
  verifyAdmin,
  async (_: Request<UserToken>, res, next) => {
    try {
      await prisma.flight.deleteMany({});
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
