import express from 'express';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/', async (_, res) => {
  try {
    const users = await prisma.user.findMany({});
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

export default router;
