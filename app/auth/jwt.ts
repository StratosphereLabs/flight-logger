import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { prisma } from '../db';

export const JWT_SECRET = process.env.JWT_SECRET ?? '';

export const generateToken: RequestHandler = (req, res) => {
  if (req.user === undefined) {
    res.sendStatus(401);
  }
  const sub = req.user?.username;
  const token = jwt.sign({ sub }, JWT_SECRET, {
    expiresIn: '24h',
  });
  res.json({ token });
};

export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  },
  async ({ sub }, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username: sub as string,
        },
      });
      if (user === null) {
        return done(new Error('User not found'));
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  },
);
