import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';
import { updateFlightRegistrationData } from '../commands';
import { DATE_FORMAT_SHORT, DATE_FORMAT_WITH_DAY } from '../constants';
import {
  fetchFlightStatsData,
  fetchFlightStatsDataByFlightNumber,
} from '../data/flightStats';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  fetchFlightDataSchema,
  fetchFlightsByFlightNumberSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  flightIncludeObj,
  getDurationMinutes,
  getFlightTimes,
  getFlightTimestamps,
  transformFlightData,
} from '../utils';

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
  addFlightFromData: procedure
    .use(verifyAuthenticated)
    .input(fetchFlightDataSchema)
    .mutation(async ({ ctx, input }) => {
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
      const flight = await fetchFlightStatsData({
        airlineIata: airline.iata,
        flightNumber,
        departureIata,
        arrivalIata,
        isoDate: outDateISO,
      });
      if (flight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight data not found. Please enter data manually.',
        });
      }
      const outTime = new Date(flight.schedule.scheduledDepartureUTC);
      const outTimeActual =
        flight.schedule.estimatedActualDepartureUTC !== null
          ? new Date(flight.schedule.estimatedActualDepartureUTC)
          : null;
      const inTime = new Date(flight.schedule.scheduledArrivalUTC);
      const inTimeActual =
        flight.schedule.estimatedActualArrivalUTC !== null
          ? new Date(flight.schedule.estimatedActualArrivalUTC)
          : null;
      const newFlight = await prisma.flight.create({
        data: {
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
          departureAirport: {
            connect: {
              id: departureAirport.id,
            },
          },
          arrivalAirport: {
            connect: {
              id: arrivalAirport.id,
            },
          },
          airline:
            input.airline !== null
              ? {
                  connect: {
                    id: input.airline.id,
                  },
                }
              : undefined,
          flightNumber: input.flightNumber,
          outTime,
          outTimeActual,
          inTime,
          inTimeActual,
          duration: getDurationMinutes({
            start: outTime,
            end: inTime,
          }),
          departureGate: flight.departureAirport.gate ?? undefined,
          arrivalGate: flight.arrivalAirport.gate ?? undefined,
          departureTerminal: flight.departureAirport.terminal ?? undefined,
          arrivalTerminal: flight.arrivalAirport.terminal ?? undefined,
          arrivalBaggage: flight.arrivalAirport.baggage ?? undefined,
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
        },
      });
      await updateFlightRegistrationData([newFlight]);
      const updatedFlight = await prisma.flight.findUnique({
        where: {
          id: newFlight.id,
        },
        include: flightIncludeObj,
      });
      if (updatedFlight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      return transformFlightData(updatedFlight);
    }),
});

export type FlightDataRouter = typeof flightDataRouter;

export type FlightDataRouterOutput = inferRouterOutputs<FlightDataRouter>;
