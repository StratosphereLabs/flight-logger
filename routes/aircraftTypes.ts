import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.aircraft_type.findMany({});
  return res.status(200).json(response);
});

router.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  const aircraftTypes = await prisma.aircraft_type.findMany({
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
  if (aircraftTypes.length === 0) {
    return res.sendStatus(404);
  }
  return res.status(200).json(aircraftTypes);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const aircraftType = await prisma.aircraft_type.findUnique({
    where: {
      id,
    },
  });
  if (aircraftType === null) {
    return res.sendStatus(404);
  }
  return res.status(200).json(aircraftType);
});

export default router;
