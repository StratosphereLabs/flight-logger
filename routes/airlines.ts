import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res, next) => {
  try {
    const response = await prisma.airline.findMany({});
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/search/:query', async (req, res, next) => {
  const { query } = req.params;
  try {
    const airlines = await prisma.airline.findMany({
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
      orderBy: {
        destinations: {
          sort: 'desc',
          nulls: 'last',
        },
      },
    });
    return res.status(200).json(airlines);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const airline = await prisma.airline.findUnique({
      where: {
        id,
      },
    });
    if (airline === null) {
      throw createHttpError(404, 'Airline not found.');
    }
    return res.status(200).json(airline);
  } catch (err) {
    next(err);
  }
});

export default router;
