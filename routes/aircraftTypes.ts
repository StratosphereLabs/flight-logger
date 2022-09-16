import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res, next) => {
  try {
    const response = await prisma.aircraft_type.findMany({});
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/search/:query', async (req, res, next) => {
  const { query } = req.params;
  try {
    const aircraftTypes = await prisma.aircraft_type.findMany({
      where: {
        OR: [
          {
            id: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    return res.status(200).json(aircraftTypes);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const aircraftType = await prisma.aircraft_type.findUnique({
      where: {
        id,
      },
    });
    if (aircraftType === null) {
      throw createHttpError(404, 'Aircraft type not found.');
    }
    return res.status(200).json(aircraftType);
  } catch (err) {
    next(err);
  }
});

export default router;
