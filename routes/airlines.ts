import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.airline.findMany({});
  return res.status(200).json(response);
});

router.get('/search/:query', async (req, res) => {
  const { query } = req.params;
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
  });
  if (airlines.length === 0) {
    return res.sendStatus(404);
  }
  return res.status(200).json(airlines);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const airline = await prisma.airline.findUnique({
    where: {
      id,
    },
  });
  if (airline === null) {
    return res.sendStatus(404);
  }
  return res.status(200).json(airline);
});

export default router;
