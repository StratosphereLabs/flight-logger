import express from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res, next) => {
  try {
    const response = await prisma.country.findMany({});
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

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
