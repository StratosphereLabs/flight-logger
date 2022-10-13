import { router } from '../trpc';
import { aircraftTypesRouter } from './aircraftTypes';
import { airlinesRouter } from './airlines';
import { airportsRouter } from './airports';
import { countriesRouter } from './countries';
import { flightsRouter } from './flights';
import { passwordResetRouter } from './passwordReset';
import { regionsRouter } from './regions';
import { tripsRouter } from './trips';
import { usersRouter } from './users';

export * from './googleAuth';

export const trpcRouter = router({
  aircraftTypes: aircraftTypesRouter,
  airlines: airlinesRouter,
  airports: airportsRouter,
  countries: countriesRouter,
  flights: flightsRouter,
  passwordReset: passwordResetRouter,
  regions: regionsRouter,
  trips: tripsRouter,
  users: usersRouter,
});
