import express, { RequestHandler } from 'express';
import passport from 'passport';
import { googleStrategy } from '../app/auth';

passport.use(googleStrategy);

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user as Express.User);
  });
});

const router = express.Router();

router.get('/google', passport.authenticate('google') as RequestHandler);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login',
  }) as RequestHandler,
);

router.post('/logout', (req, res, next) => {
  req.logout((err: Error | null) => {
    if (err !== null) {
      return next(err);
    }
    res.redirect('/');
  });
});

export default router;
