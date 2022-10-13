import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { searchSchema } from '../schemas/search';
import { publicProcedure, router } from '../trpc';
import { getAirportSchema, getAirportsSchema } from '../schemas';
import { getPaginatedResponse, parsePaginationRequest } from '../utils';

export const airportsRouter = router({
  getAirports: publicProcedure
    .input(getAirportsSchema)
    .query(async ({ input }) => {
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const { sort, sortKey } = input;
      try {
        const [results, itemCount] = await prisma.$transaction([
          prisma.airport.findMany({
            skip,
            take,
            orderBy:
              sortKey !== null
                ? {
                    [sortKey as string]: sort ?? 'asc',
                  }
                : undefined,
          }),
          prisma.airport.count(),
        ]);
        return getPaginatedResponse({
          itemCount,
          limit,
          page,
          results,
        });
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  searchAirports: publicProcedure
    .input(searchSchema)
    .query(async ({ input }) => {
      const { query } = input;
      try {
        const airports = await prisma.airport.findMany({
          take: 5,
          where: {
            OR: [
              {
                id: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        });
        return airports;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  getAirport: publicProcedure
    .input(getAirportSchema)
    .query(async ({ input }) => {
      const { id } = input;
      try {
        const airport = await prisma.airport.findUnique({
          where: {
            id,
          },
        });
        if (airport === null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Airport not found.',
          });
        }
        return airport;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
});
