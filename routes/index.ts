import express from 'express';

import aircraftTypesRouter from './aircraftTypes';
import airlinesRouter from './airlines';
import airportsRouter from './airports';
import authRouter from './auth';
import countriesRouter from './countries';
import flightsRouter from './flights';
import regionsRouter from './regions';
import tripsRouter from './trips';
import usersRouter from './users';

const router = express.Router();

router.get('/', (_, res) => {
  res.status(200).json({ message: 'FlightLogger API Home Page' });
});

router.use('/auth', authRouter);

router.use('/users', usersRouter);
router.use('/aircraft-types', aircraftTypesRouter);
router.use('/airlines', airlinesRouter);
router.use('/airports', airportsRouter);
router.use('/countries', countriesRouter);
router.use('/flights', flightsRouter);
router.use('/regions', regionsRouter);
router.use('/trips', tripsRouter);

export default router;
