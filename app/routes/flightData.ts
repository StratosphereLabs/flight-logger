import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';
import { fetchFlightStatsData } from '../commands/flightStats';
import { DATE_FORMAT_ISO, DATE_FORMAT_SHORT } from '../constants';
import { prisma } from '../db';
import { fetchFlightsByFlightNumberSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { getFlightTimes, getFlightTimestamps } from '../utils';

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
      const airportIds = [
        ...new Set(
          flightStatsFlightData.flights.flatMap(
            ({ departureAirport, arrivalAirport }) => [
              departureAirport.iata,
              arrivalAirport.iata,
            ],
          ),
        ),
      ];
      const airports = await prisma.airport.findMany({
        where: {
          iata: {
            in: airportIds,
          },
        },
      });
      const groupedAirports = groupBy(airports, 'iata');
      return flightStatsFlightData.flights.map((flight, index) => {
        const departureAirport =
          groupedAirports[flight.departureAirport.iata][0];
        const arrivalAirport = groupedAirports[flight.arrivalAirport.iata][0];
        const { outTime, inTime, duration } = getFlightTimes({
          departureAirport,
          arrivalAirport,
          outDateISO: input.outDateISO,
          outTimeValue: flight.departureTime24,
          inTimeValue: flight.arrivalTime24,
        });
        const timestamps = getFlightTimestamps({
          departureAirport,
          arrivalAirport,
          duration,
          outTime,
          inTime,
        });
        return {
          id: index,
          duration,
          outTimeDate: formatInTimeZone(
            outTime,
            departureAirport.timeZone,
            DATE_FORMAT_SHORT,
          ),
          ...flight,
          ...timestamps,
        };
      });
    }),
});

export type FlightDataRouter = typeof flightDataRouter;

export type FlightDataRouterOutput = inferRouterOutputs<FlightDataRouter>;
