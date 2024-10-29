/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { isFuture } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  updateFlightRegistrationData,
  updateFlightTimesData,
} from '../commands';
import { DATE_FORMAT_SHORT, DATE_FORMAT_WITH_DAY } from '../constants';
import { fetchFlightAwareDataByFlightNumber } from '../data/flightAware';
import { fetchFlightRadarDataByFlightNumber } from '../data/flightRadar';
import { fetchFlightStatsDataByFlightNumber } from '../data/flightStats';
import type {
  FlightSearchDataFetchResult,
  FlightSearchDataResult,
} from '../data/types';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import { addFlightFromDataSchema, searchFlightDataSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { getDurationMinutes, getFlightTimestamps } from '../utils';

export const flightDataRouter = router({
  fetchFlightsByFlightNumber: procedure
    .input(searchFlightDataSchema)
    .query(async ({ input }) => {
      const { airline, flightNumber, outDateISO } = input;
      const inFuture = isFuture(new Date(input.outDateISO));
      let flights: FlightSearchDataFetchResult[] | null = null;
      if (inFuture) {
        flights = await fetchFlightRadarDataByFlightNumber({
          airline: airline!,
          flightNumber: flightNumber!,
          isoDate: outDateISO,
        });
      } else if (process.env.FLIGHT_TIMES_DATASOURCE === 'flightaware') {
        flights = await fetchFlightAwareDataByFlightNumber({
          airline: airline!,
          flightNumber: flightNumber!,
          isoDate: outDateISO,
        });
      } else if (process.env.FLIGHT_TIMES_DATASOURCE === 'flightstats') {
        flights = await fetchFlightStatsDataByFlightNumber({
          airline: airline!,
          flightNumber: flightNumber!,
          isoDate: outDateISO,
        });
      }
      if (flights === null) return [];
      const flightData: FlightSearchDataResult[] = flights.flatMap(
        (flight, index) => {
          const duration = getDurationMinutes({
            start: flight.outTime,
            end: flight.inTime,
          });
          const timestamps = getFlightTimestamps({
            departureTimeZone: flight.departureAirport.timeZone,
            arrivalTimeZone: flight.arrivalAirport.timeZone,
            duration,
            outTime: flight.outTime,
            inTime: flight.inTime,
          });
          return {
            ...timestamps,
            ...flight,
            id: index,
            outTimeDate: formatInTimeZone(
              flight.outTime,
              flight.departureAirport.timeZone,
              DATE_FORMAT_WITH_DAY,
            ),
            outTimeDateAbbreviated: formatInTimeZone(
              flight.outTime,
              flight.departureAirport.timeZone,
              DATE_FORMAT_SHORT,
            ),
          };
        },
      );
      return flightData;
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
              omit: {
                id: false,
              },
            })
          : undefined;
      if (user === null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: `Unable to add flight for user @${input.username}`,
        });
      }
      const outTime = new Date(input.outTime);
      const inTime = new Date(input.inTime);
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
              id: input.departureIcao,
            },
          },
          arrivalAirport: {
            connect: {
              id: input.arrivalIcao,
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
          inTime,
          duration: getDurationMinutes({
            start: outTime,
            end: inTime,
          }),
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
        },
      });
      await updateFlightTimesData([newFlight]);
      await updateFlightRegistrationData([newFlight]);
    }),
});

export type FlightDataRouter = typeof flightDataRouter;

export type FlightDataRouterOutput = inferRouterOutputs<FlightDataRouter>;
