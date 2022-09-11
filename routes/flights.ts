import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.flight.findMany({
    include: {
      departureAirport: true,
      arrivalAirport: true,
      airline: true,
      aircraftType: true,
    },
  });
  return res.status(200).json(response);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const flight = await prisma.flight.findUnique({
      where: {
        id,
      },
    });
    if (flight === null) {
      return res.sendStatus(404);
    }
    return res.status(200).json(flight);
  } catch (err) {
    return res.sendStatus(404);
  }
});

export default router;
