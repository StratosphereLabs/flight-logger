import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res, next) => {
  try {
    const response = await prisma.region.findMany({});
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

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
