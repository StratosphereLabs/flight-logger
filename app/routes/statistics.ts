import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import {
  type AirlineData,
  type AircraftTypeData,
  type AirportData,
  type RouteData,
  getUserProfileFlightsSchema,
  getUserTopRoutesSchema,
  getUserTopAirlinesSchema,
  getUserTopAircraftTypesSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import { calculateDistance, parsePaginationRequest } from '../utils';

export const statisticsRouter = router({
  getTopRoutes: procedure
    .input(getUserTopRoutesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      return Object.values(
        results.reduce<Record<string, RouteData>>((acc, flight) => {
          const key = input.cityPairs
            ? [flight.departureAirport.iata, flight.arrivalAirport.iata]
                .sort((a, b) => a.localeCompare(b))
                .join('-')
            : `${flight.departureAirport.iata}-${flight.arrivalAirport.iata}`;
          return {
            ...acc,
            [key]: {
              route: key,
              flights: (acc[key]?.flights ?? 0) + 1,
            },
          };
        }, {}),
      )
        .sort((a, b) => b.flights - a.flights)
        .slice(skip, skip + take)
        .reverse();
    }),
  getTopAirlines: procedure
    .input(getUserTopAirlinesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      return Object.values(
        results.reduce<Record<string, AirlineData>>((acc, flight) => {
          if (flight.airline === null) return acc;
          const key = `${
            flight.airline.iata !== null ? `${flight.airline.iata}/` : ''
          }${flight.airline.icao}`;
          const distance = calculateDistance(
            flight.departureAirport.lat,
            flight.departureAirport.lon,
            flight.arrivalAirport.lat,
            flight.arrivalAirport.lon,
          );
          return {
            ...acc,
            [key]: {
              id: flight.airline.id,
              airline: key,
              flights: (acc[key]?.flights ?? 0) + 1,
              distance: (acc[key]?.distance ?? 0) + distance,
              duration: (acc[key]?.duration ?? 0) + flight.duration,
            },
          };
        }, {}),
      )
        .sort((a, b) => {
          if (input.mode === 'distance') return b.distance - a.distance;
          if (input.mode === 'duration') return b.duration - a.duration;
          return b.flights - a.flights;
        })
        .slice(skip, skip + take)
        .map(result => ({
          ...result,
          distance: Math.round(result.distance),
        }))
        .reverse();
    }),
  getTopAirports: procedure
    .input(getUserProfileFlightsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      return Object.values(
        results.reduce<Record<string, AirportData>>(
          (acc, flight) => ({
            ...acc,
            [flight.departureAirportId]: {
              id: flight.departureAirportId,
              airport: flight.departureAirport.iata,
              flights: (acc[flight.departureAirportId]?.flights ?? 0) + 1,
            },
            [flight.arrivalAirportId]: {
              id: flight.arrivalAirportId,
              airport: flight.arrivalAirport.iata,
              flights: (acc[flight.arrivalAirportId]?.flights ?? 0) + 1,
            },
          }),
          {},
        ),
      )
        .sort((a, b) => b.flights - a.flights)
        .slice(skip, skip + take)
        .reverse();
    }),
  getTopAircraftTypes: procedure
    .input(getUserTopAircraftTypesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        include: {
          aircraftType: true,
          airframe: {
            include: {
              aircraftType: true,
            },
          },
          arrivalAirport: true,
          departureAirport: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      return Object.values(
        results.reduce<Record<string, AircraftTypeData>>((acc, flight) => {
          const aircraftType =
            flight.airframe?.aircraftType ?? flight.aircraftType;
          if (aircraftType === null) return acc;
          const distance = calculateDistance(
            flight.departureAirport.lat,
            flight.departureAirport.lon,
            flight.arrivalAirport.lat,
            flight.arrivalAirport.lon,
          );
          return {
            ...acc,
            [aircraftType.icao]: {
              id: aircraftType.id,
              aircraftType: aircraftType.icao,
              flights: (acc[aircraftType.icao]?.flights ?? 0) + 1,
              distance: (acc[aircraftType.icao]?.distance ?? 0) + distance,
              duration:
                (acc[aircraftType.icao]?.duration ?? 0) + flight.duration,
            },
          };
        }, {}),
      )
        .sort((a, b) => {
          if (input.mode === 'distance') return b.distance - a.distance;
          if (input.mode === 'duration') return b.duration - a.duration;
          return b.flights - a.flights;
        })
        .slice(skip, skip + take)
        .map(result => ({
          ...result,
          distance: Math.round(result.distance),
        }))
        .reverse();
    }),
});
