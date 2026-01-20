import { router } from '../trpc';
import { aircraftTypesRouter } from './aircraftTypes';
import { airframesRouter } from './airframes';
import { airlinesRouter } from './airlines';
import { airportsRouter } from './airports';
import { authRouter } from './auth';
import { countriesRouter } from './countries';
import { flightDataRouter } from './flightData';
import { flightsRouter } from './flights';
import { passwordResetRouter } from './passwordReset';
import { regionsRouter } from './regions';
import { registrationsRouter } from './registrations';
import { statisticsRouter } from './statistics';
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
  flightData: flightDataRouter,
  flights: flightsRouter,
  passwordReset: passwordResetRouter,
  registrations: registrationsRouter,
  regions: regionsRouter,
  statistics: statisticsRouter,
  users: usersRouter,
});

export type TRPCRouter = typeof trpcRouter;
