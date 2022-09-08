import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.airport.findMany({});
  return res.status(200).json(response);
});

router.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  const airports = await prisma.airport.findMany({
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
  if (airports.length === 0) {
    return res.sendStatus(404);
  }
  return res.status(200).json(airports);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const airport = await prisma.airport.findUnique({
    where: {
      id,
    },
  });
  if (airport === null) {
    return res.sendStatus(404);
  }
  return res.status(200).json(airport);
});

export default router;
