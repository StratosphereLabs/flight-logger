import { router } from '../trpc';
import { aircraftTypesRouter } from './aircraftTypes';
import { airframesRouter } from './airframes';
import { airlinesRouter } from './airlines';
import { airportsRouter } from './airports';
import { authRouter } from './auth';
import { countriesRouter } from './countries';
import { flightsRouter } from './flights';
import { itinerariesRouter } from './itineraries';
import { passwordResetRouter } from './passwordReset';
import { regionsRouter } from './regions';
import { tripsRouter } from './trips';
import { usersRouter } from './users';

export * from './googleAuth';
export * from './upload';

export const trpcRouter = router({
  aircraftTypes: aircraftTypesRouter,
  airframes: airframesRouter,
  airlines: airlinesRouter,
  airports: airportsRouter,
  auth: authRouter,
  countries: countriesRouter,
  flights: flightsRouter,
  itineraries: itinerariesRouter,
  passwordReset: passwordResetRouter,
  regions: regionsRouter,
  trips: tripsRouter,
  users: usersRouter,
});

export type TRPCRouter = typeof trpcRouter;
