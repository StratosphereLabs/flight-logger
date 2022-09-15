import express from 'express';

const router = express.Router();

router.post('/google/callback', (req, res, next) => {
  console.log({ req });
  res.status(200).json(req.body);
});

router.post('/logout', (req, res, next) => {
  req.logout((err?: Error | null) => {
    if (err !== null && err !== undefined) {
      return next(err);
    }
    res.redirect('/api/airports/KPDX');
  });
});

export default router;
