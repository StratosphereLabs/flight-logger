import express, { RequestHandler } from 'express';
import passport from 'passport';
import { generateToken, googleStrategy, jwtStrategy } from '../app/auth';
import { prisma } from '../app/db';

const router = express.Router();

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
passport.serializeUser<any, any>((_, user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  console.log({ id });
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: id as string,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(googleStrategy);
passport.use(jwtStrategy);

router.use(passport.initialize());

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email'] }) as RequestHandler,
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
  }) as RequestHandler,
  generateToken,
);

router.get(
  '/twitter',
  passport.authenticate('twitter', { scope: ['email'] }) as RequestHandler,
);

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    failureRedirect: '/login',
  }) as RequestHandler,
  generateToken,
);

router.get('/logout', (req, res) => {
  req.logout({}, () => res.redirect('/'));
});

export default router;
