import express from 'express';
import { Request } from 'express-jwt';
import createHttpError from 'http-errors';
import { authorizeToken, UserToken, verifyAdmin } from '../app/auth';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const flight = await prisma.flight.findUnique({
      where: {
        id,
      },
    });
    if (flight === null) {
      throw createHttpError(404, 'Flight not found.');
    }
    return res.status(200).json(flight);
  } catch (err) {
    next(err);
  }
});

// TODO: Remove in production
router.delete(
  '/',
  authorizeToken(true),
  verifyAdmin,
  async (_: Request<UserToken>, res, next) => {
    try {
      await prisma.flight.deleteMany({});
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
