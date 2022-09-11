import express, { RequestHandler } from 'express';
import { generateToken, passport } from '../app/auth';

const router = express.Router();

router.use(passport.initialize());

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }) as RequestHandler,
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
  }) as RequestHandler,
  generateToken,
);

router.get('/logout', (req, res) => {
  req.logout({}, () => res.redirect('/'));
});

export default router;
