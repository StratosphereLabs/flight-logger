import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';
import { paginatedResults, paginateOptions } from '../app/utils';

const router = express.Router();

router.get(
  '/',
  paginateOptions,
  async (req, res, next) => {
    const {
      query: { limit },
      skip,
    } = req;
    try {
      const [results, itemCount] = await prisma.$transaction([
        prisma.airport.findMany({
          skip,
          take: Number(limit),
        }),
        prisma.airport.count(),
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

router.get('/search/:query', async (req, res, next) => {
  const { query } = req.params;
  try {
    const airports = await prisma.airport.findMany({
      take: 10,
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
        scheduledService: 'desc',
      },
    });
    return res.status(200).json(airports);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const airport = await prisma.airport.findUnique({
      where: {
        id,
      },
    });
    if (airport === null) {
      throw createHttpError(404, 'Airport not found.');
    }
    return res.status(200).json(airport);
  } catch (err) {
    next(err);
  }
});

export default router;
