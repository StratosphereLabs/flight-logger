import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res, next) => {
  try {
    const response = await prisma.trip.findMany({});
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({
      where: {
        id,
      },
    });
    if (trip === null) {
      throw createHttpError(404, 'Trip not found.');
    }
    return res.status(200).json(trip);
  } catch (err) {
    next(err);
  }
});

export default router;
