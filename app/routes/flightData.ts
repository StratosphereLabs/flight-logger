import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { fetchFlightStatsData } from '../commands/flightStats';
import { DATE_FORMAT_ISO } from '../constants';
import { fetchFlightsByFlightNumberSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const flightDataRouter = router({
  fetchFlightsByFlightNumber: procedure
    .input(fetchFlightsByFlightNumberSchema)
    .query(async ({ input }) => {
      const { airline, flightNumber, outDateISO } = input;
      if (airline === null || flightNumber === null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Airline and Flight Number are required.',
        });
      }
      const data = await fetchFlightStatsData(airline.iata, flightNumber);
      if (data === null) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to fetch flight times. Please try again later.',
        });
      }
      const { otherDays } = data.props.initialState.flightTracker;
      const flightStatsFlightData =
        typeof otherDays === 'object'
          ? otherDays.find(({ date1, year }) => {
              const date = format(
                new Date(`${year}-${date1}`),
                DATE_FORMAT_ISO,
              );
              return date === outDateISO;
            })
          : undefined;
      if (flightStatsFlightData === undefined) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to fetch flight times. Please try again later.',
        });
      }
      return flightStatsFlightData.flights;
    }),
});

export type FlightDataRouter = typeof flightDataRouter;

export type FlightDataRouterOutput = inferRouterOutputs<FlightDataRouter>;
