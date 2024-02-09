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
          const orderedAirports = [
            flight.departureAirport,
            flight.arrivalAirport,
          ].sort(({ id: a }, { id: b }) => a.localeCompare(b));
          const key = orderedAirports.map(({ id }) => id).join('-');
          return {
            ...acc,
            [key]: {
              firstAirport: orderedAirports[0],
              secondAirport: orderedAirports[1],
              count: (acc[key]?.count ?? 0) + 1,
            },
          };
        }, {}),
      )
        .sort((a, b) => b.count - a.count)
        .slice(skip, skip + take);
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
          const key = `${flight.departureAirportId}-${flight.arrivalAirportId}`;
          return {
            ...acc,
            [key]: {
              departureAirport: flight.departureAirport,
              arrivalAirport: flight.arrivalAirport,
              count: (acc[key]?.count ?? 0) + 1,
            },
          };
        }, {}),
      )
        .sort((a, b) => b.count - a.count)
        .slice(skip, skip + take);
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
          return {
            ...acc,
            [flight.airline.id]: {
              airline: flight.airline,
              count: (acc[flight.airline.id]?.count ?? 0) + 1,
            },
          };
        }, {}),
      )
        .sort((a, b) => b.count - a.count)
        .slice(skip, skip + take);
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
              airport: flight.departureAirport,
              count: (acc[flight.departureAirportId]?.count ?? 0) + 1,
            },
            [flight.arrivalAirportId]: {
              airport: flight.arrivalAirport,
              count: (acc[flight.arrivalAirportId]?.count ?? 0) + 1,
            },
          }),
          {},
        ),
      )
        .sort((a, b) => b.count - a.count)
        .slice(skip, skip + take);
    }),
});
