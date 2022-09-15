import express from 'express';
import { Request as JwtRequest } from 'express-jwt';
import { authorizeToken, UserToken, verifyAdmin } from '../app/auth';
import { prisma } from '../app/db';

const router = express.Router();

router.use(authorizeToken);

router.get('/', verifyAdmin, async (_, res) => {
  try {
    const users = await prisma.user.findMany({});
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get('/:username', async (req: JwtRequest<UserToken>, res, next) => {
  const { username } = req.params;
  if (username !== req.auth?.username) {
    return next(new Error('Unauthorized'));
  }
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (user === null) {
    return res.sendStatus(404);
  }
  return res.status(200).json(user);
});

export default router;
