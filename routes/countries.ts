import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';
import { paginatedResults, paginateOptions } from '../app/middleware';

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
        prisma.country.findMany({
          skip,
          take: Number(limit),
        }),
        prisma.country.count(),
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

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const country = await prisma.country.findUnique({
      where: {
        id,
      },
    });
    if (country === null) {
      throw createHttpError(404, 'Country not found.');
    }
    return res.status(200).json(country);
  } catch (err) {
    next(err);
  }
});

export default router;
