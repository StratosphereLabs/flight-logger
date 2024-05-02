import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';
import { updateFlightRegistrationData } from '../commands';
import { DATE_FORMAT_SHORT, DATE_FORMAT_WITH_DAY } from '../constants';
import { fetchFlightAwareData } from '../data/flightAware/fetchFlightAwareData';
import { createNewDate } from '../data/flightRadar/utils';
import { fetchFlightStatsData } from '../data/flightStats';
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
      const flights = await fetchFlightAwareData({
        airline,
        flightNumber,
        isoDate: outDateISO,
      });
      if (flights === null) return [];
      return flights.flatMap((flight, index) => {
        const outTime = createNewDate(flight.gateDepartureTimes.scheduled);
        const inTime = createNewDate(flight.gateArrivalTimes.scheduled);
        const duration = getDurationMinutes({
          start: outTime,
          end: inTime,
        });
        const timestamps = getFlightTimestamps({
          departureTimeZone: flight.origin.TZ.replace(/:/g, ''),
          arrivalTimeZone: flight.destination.TZ.replace(/:/g, ''),
          duration,
          outTime,
          inTime,
        });
        return {
          id: index,
          duration,
          outTimeDate: formatInTimeZone(
            outTime,
            flight.origin.TZ.replace(/:/g, ''),
            DATE_FORMAT_WITH_DAY,
          ),
          outTimeDateAbbreviated: formatInTimeZone(
            outTime,
            flight.origin.TZ.replace(/:/g, ''),
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
        airline,
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
