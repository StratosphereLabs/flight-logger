import express from 'express';
import { Request as JwtRequest } from 'express-jwt';
import createHttpError from 'http-errors';
import { authorizeToken, UserToken, verifyAdmin } from '../app/auth';
import { prisma } from '../app/db';

const router = express.Router();

router.get('/:username', async (req: JwtRequest<UserToken>, res, next) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (user === null) {
      throw createHttpError(404, 'User not found');
    }
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.use(authorizeToken);

router.get('/', verifyAdmin, async (_, res, next) => {
  try {
    const users = await prisma.user.findMany({});
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
