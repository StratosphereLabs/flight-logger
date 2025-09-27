/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Airport } from '@prisma/client';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { isFuture } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';

import {
  updateFlightData,
  updateFlightWeatherReports,
  updateOnTimePerformanceData,
  updateTrackAircraftData,
} from '../commands';
import { DATE_FORMAT_SHORT, DATE_FORMAT_WITH_DAY } from '../constants';
import { searchFlightRadarFlightsByFlightNumber } from '../data/flightRadar';
import { searchFlightStatsFlightsByFlightNumber } from '../data/flightStats';
import type {
  FlightSearchDataFetchResult,
  FlightSearchDataResult,
} from '../data/types';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import { addFlightFromDataSchema, searchFlightDataSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { getDurationMinutes, getFlightTimestamps, getMidpoint } from '../utils';

export const flightDataRouter = router({
  searchFlightsByFlightNumber: procedure
    .input(searchFlightDataSchema)
    .query(async ({ input }) => {
      const { airline, flightNumber, outDateISO } = input;
      let flights: FlightSearchDataFetchResult[] = [];
      if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
        flights = await searchFlightStatsFlightsByFlightNumber({
          airline,
          flightNumber,
          isoDate: outDateISO,
        });
      }
      if (
        process.env.DATASOURCE_FLIGHTRADAR === 'true' &&
        flights.length === 0
      ) {
        flights = await searchFlightRadarFlightsByFlightNumber({
          airline,
          flightNumber,
          isoDate: outDateISO,
        });
      }
      const flightData: FlightSearchDataResult[] = flights.map(
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
          const departureRegion =
            flight.departureAirport.countryId === 'US' ||
            flight.departureAirport.countryId === 'CA'
              ? flight.departureAirport.regionId.split('-')[1]
              : flight.departureAirport.countryId;
          const departureMunicipalityText = `${flight.departureAirport.municipality}, ${departureRegion}`;
          const arrivalRegion =
            flight.arrivalAirport.countryId === 'US' ||
            flight.arrivalAirport.countryId === 'CA'
              ? flight.arrivalAirport.regionId.split('-')[1]
              : flight.arrivalAirport.countryId;
          const arrivalMunicipalityText = `${flight.arrivalAirport.municipality}, ${arrivalRegion}`;
          return {
            ...timestamps,
            ...flight,
            id: index,
            departureMunicipalityText,
            arrivalMunicipalityText,
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
      const groupedFlights = groupBy(
        flightData,
        ({ departureAirport, arrivalAirport }) =>
          [departureAirport.id, arrivalAirport.id].sort().join('-'),
      );
      const routes = Object.values(groupedFlights).map(flights => ({
        airports: [flights[0].departureAirport, flights[0].arrivalAirport],
        frequency: flights.length,
        isCompleted: flights.some(({ inTime }) => !isFuture(inTime)),
        midpoint: getMidpoint(
          flights[0].departureAirport.lat,
          flights[0].departureAirport.lon,
          flights[0].arrivalAirport.lat,
          flights[0].arrivalAirport.lon,
        ),
      }));
      return {
        routes,
        airports: Object.values(
          routes.reduce<Record<string, Airport>>(
            (acc, { airports }) => ({
              ...acc,
              [airports[0].id]: airports[0],
              [airports[1].id]: airports[1],
            }),
            {},
          ),
        ),
        results: flightData,
      };
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
          diversionAirport: true,
          airline: true,
        },
      });
      const updatedFlights = await updateFlightData([newFlight]);
      await updateTrackAircraftData(updatedFlights);
      await updateOnTimePerformanceData(updatedFlights);
      await updateFlightWeatherReports(updatedFlights);
    }),
});

export type FlightDataRouter = typeof flightDataRouter;

export type FlightDataRouterOutput = inferRouterOutputs<FlightDataRouter>;
