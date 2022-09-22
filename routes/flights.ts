import express, { NextFunction, Response } from 'express';
import { Request } from 'express-jwt';
import createHttpError from 'http-errors';
import multer from 'multer';
import { authorizeToken, UserToken } from '../app/auth';
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

router.use(authorizeToken());

router.post(
  '/upload/flightdiary',
  upload.single('file'),
  async (req: Request<UserToken>, res: Response, next: NextFunction) => {
    const { file } = req;
    const userId = req.auth?.id;
    if (userId === undefined) {
      return next(createHttpError(401, 'Unable to authenticate'));
    }
    try {
      const flights = await saveFlightDiaryData(userId, file);
      res.status(201).json(flights);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
