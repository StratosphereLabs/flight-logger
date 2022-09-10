import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.trip.findMany({});
  return res.status(200).json(response);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({
      where: {
        id,
      },
    });
    if (trip === null) {
      return res.sendStatus(404);
    }
    return res.status(200).json(trip);
  } catch (err) {
    return res.sendStatus(404);
  }
});

export default router;
