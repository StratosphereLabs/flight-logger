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
        prisma.airline.findMany({
          skip,
          take: Number(limit),
          orderBy:
            sortKey !== undefined
              ? {
                  [sortKey as string]: sort ?? 'asc',
                }
              : undefined,
        }),
        prisma.airline.count(),
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
    const airlines = await prisma.airline.findMany({
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
