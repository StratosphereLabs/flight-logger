import express from 'express';
import { unitedAwardCalendar } from '../middleware/flight-finder/united';

export const flightFinderRouter = express.Router();

flightFinderRouter.post('/united/award-calendar', unitedAwardCalendar);
