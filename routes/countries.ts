import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.country.findMany({});
  return res.status(200).json(response);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const country = await prisma.country.findUnique({
    where: {
      id,
    },
  });
  if (country === null) {
    return res.sendStatus(404);
  }
  return res.status(200).json(country);
});

export default router;
