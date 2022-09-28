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
        prisma.region.findMany({
          skip,
          take: Number(limit),
        }),
        prisma.region.count(),
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
    const region = await prisma.region.findUnique({
      where: {
        id,
      },
    });
    if (region === null) {
      throw createHttpError(404, 'Region not found.');
    }
    return res.status(200).json(region);
  } catch (err) {
    next(err);
  }
});

export default router;
