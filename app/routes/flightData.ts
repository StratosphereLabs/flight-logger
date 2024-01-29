import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';
import { fetchFlightRegistrationData } from '../commands/flightRadar';
import {
  fetchFlightStatsData,
  fetchFlightStatsDataByFlightNumber,
} from '../commands/flightStats';
import { DATE_FORMAT_SHORT, DATE_FORMAT_WITH_DAY } from '../constants';
import { prisma } from '../db';
import {
  fetchFlightDataSchema,
  fetchFlightsByFlightNumberSchema,
} from '../schemas';
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
      const flights = await fetchFlightStatsDataByFlightNumber({
        airlineIata: airline.iata,
        flightNumber,
        isoDate: outDateISO,
      });
      if (flights === null) return [];
      const airportIds = [
        ...new Set(
          flights.flatMap(({ departureAirport, arrivalAirport }) => [
            departureAirport.iata,
            arrivalAirport.iata,
          ]),
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
      return flights.map((flight, index) => {
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
            DATE_FORMAT_WITH_DAY,
          ),
          outTimeDateAbbreviated: formatInTimeZone(
            outTime,
            departureAirport.timeZone,
            DATE_FORMAT_SHORT,
          ),
          ...flight,
          ...timestamps,
        };
      });
    }),
  fetchFlightData: procedure
    .input(fetchFlightDataSchema)
    .query(async ({ input }) => {
      const { airline, flightNumber, outDateISO, departureIata, arrivalIata } =
        input;
      if (airline === null || flightNumber === null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Airline and Flight Number are required.',
        });
      }
      const airportIds = [departureIata, arrivalIata];
      const airports = await prisma.airport.findMany({
        where: {
          iata: {
            in: airportIds,
          },
        },
      });
      const groupedAirports = groupBy(airports, 'iata');
      const departureAirport = groupedAirports[departureIata][0];
      const arrivalAirport = groupedAirports[arrivalIata][0];
      const flightData = await fetchFlightStatsData({
        airlineIata: airline.iata,
        arrivalIata,
        departureIata,
        flightNumber,
        isoDate: outDateISO,
      });
      const registrationData = await fetchFlightRegistrationData({
        airlineIata: airline.iata,
        flightNumber,
        departureAirport,
        arrivalAirport,
        isoDate: outDateISO,
      });
      return { flightData, registrationData };
    }),
});

export type FlightDataRouter = typeof flightDataRouter;

export type FlightDataRouterOutput = inferRouterOutputs<FlightDataRouter>;
