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
      query: { limit, sortKey, sort },
      skip,
    } = req;
    try {
      const [results, itemCount] = await prisma.$transaction([
        prisma.aircraft_type.findMany({
          skip,
          take: Number(limit),
          orderBy:
            sortKey !== undefined
              ? {
                  [sortKey as string]: sort ?? 'asc',
                }
              : undefined,
        }),
        prisma.aircraft_type.count(),
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
    const aircraftTypes = await prisma.aircraft_type.findMany({
      take: 5,
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
