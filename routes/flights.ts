import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';

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

export default router;
