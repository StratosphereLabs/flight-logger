import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import {
  type AirlineData,
  type AirportData,
  type CityPairData,
  type RouteData,
  getUserProfileFlightsSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import { parsePaginationRequest } from '../utils';

export const statisticsRouter = router({
  getTopCityPairs: procedure
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
        results.reduce<Record<string, CityPairData>>((acc, flight) => {
          const key = [flight.departureAirport.iata, flight.arrivalAirport.iata]
            .sort((a, b) => a.localeCompare(b))
            .join('-');
          return {
            ...acc,
            [key]: {
              cityPair: key,
              flights: (acc[key]?.flights ?? 0) + 1,
            },
          };
        }, {}),
      )
        .sort((a, b) => b.flights - a.flights)
        .slice(skip, skip + take)
        .reverse();
    }),
  getTopRoutes: procedure
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
        results.reduce<Record<string, RouteData>>((acc, flight) => {
          const key = `${flight.departureAirport.iata}-${flight.arrivalAirport.iata}`;
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
          return {
            ...acc,
            [key]: {
              id: flight.airline.id,
              airline: key,
              flights: (acc[key]?.flights ?? 0) + 1,
            },
          };
        }, {}),
      )
        .sort((a, b) => b.flights - a.flights)
        .slice(skip, skip + take)
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
});
