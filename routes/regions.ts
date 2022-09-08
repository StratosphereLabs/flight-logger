import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.region.findMany({});
  return res.status(200).json(response);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const region = await prisma.region.findUnique({
    where: {
      id,
    },
  });
  if (region === null) {
    return res.sendStatus(404);
  }
  return res.status(200).json(region);
});

export default router;
