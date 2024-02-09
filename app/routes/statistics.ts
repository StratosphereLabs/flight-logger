import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { type CityPairData, getUserSchema, type RouteData } from '../schemas';
import { procedure, router } from '../trpc';

export const statisticsRouter = router({
  getTopAirports: procedure
    .input(getUserSchema)
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
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const topCityPairs = Object.values(
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
      ).sort((a, b) => b.count - a.count);
      const topRoutes = Object.values(
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
      ).sort((a, b) => b.count - a.count);
      return {
        topCityPairs,
        topRoutes,
      };
    }),
});
