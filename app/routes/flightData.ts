import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';
import { updateFlightRegistrationData } from '../commands';
import { DATE_FORMAT_SHORT, DATE_FORMAT_WITH_DAY } from '../constants';
import { fetchFlightAwareDataByFlightNumber } from '../data/flightAware';
import { createNewDate } from '../data/utils';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  addFlightFromDataSchema,
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
      const flights = await fetchFlightAwareDataByFlightNumber({
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
    .input(addFlightFromDataSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.airline === null || input.flightNumber === null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Airline and Flight Number are required.',
        });
      }
      const user =
        input.username !== undefined
          ? await prisma.user.findUnique({
              where: {
                username: input.username,
                followedBy: {
                  some: {
                    username: ctx.user.username,
                  },
                },
                following: {
                  some: {
                    username: ctx.user.username,
                  },
                },
              },
            })
          : undefined;
      if (user === null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: `Unable to add flight for user @${input.username}`,
        });
      }
      const airportIds = [input.departureIcao, input.arrivalIcao];
      const airports = await prisma.airport.findMany({
        where: {
          id: {
            in: airportIds,
          },
        },
      });
      const groupedAirports = groupBy(airports, 'id');
      const departureAirport = groupedAirports[input.departureIcao][0];
      const arrivalAirport = groupedAirports[input.arrivalIcao][0];
      if (departureAirport === undefined || arrivalAirport === undefined) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or more airports not found.',
        });
      }
      const aircraftType =
        input.aircraftTypeIcao !== null
          ? await prisma.aircraft_type.findFirst({
              where: {
                icao: input.aircraftTypeIcao,
              },
            })
          : null;
      const outTime = createNewDate(input.departureTime);
      const outTimeActual =
        input.departureTimeActual !== null
          ? createNewDate(input.departureTimeActual)
          : input.departureTimeEstimated !== null
            ? createNewDate(input.departureTimeEstimated)
            : null;
      const inTime = createNewDate(input.arrivalTime);
      const inTimeActual =
        input.arrivalTimeActual !== null
          ? createNewDate(input.arrivalTimeActual)
          : input.arrivalTimeEstimated !== null
            ? createNewDate(input.arrivalTimeEstimated)
            : null;
      const newFlight = await prisma.flight.create({
        data: {
          user: {
            connect: {
              id: user?.id ?? ctx.user.id,
            },
          },
          addedByUser:
            user !== undefined
              ? {
                  connect: {
                    id: ctx.user.id,
                  },
                }
              : undefined,
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
          aircraftType:
            aircraftType !== null
              ? {
                  connect: {
                    id: aircraftType.id,
                  },
                }
              : undefined,
          outTime,
          outTimeActual,
          inTime,
          inTimeActual,
          duration: getDurationMinutes({
            start: outTime,
            end: inTime,
          }),
          departureGate: input.departureGate ?? undefined,
          arrivalGate: input.arrivalGate ?? undefined,
          departureTerminal: input.departureTerminal ?? undefined,
          arrivalTerminal: input.arrivalTerminal ?? undefined,
          arrivalBaggage: undefined,
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
