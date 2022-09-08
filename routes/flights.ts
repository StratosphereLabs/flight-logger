import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  const response = await prisma.flight.findMany({});
  return res.status(200).json(response);
});

export default router;
