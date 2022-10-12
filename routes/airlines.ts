import { TRPCError } from '@trpc/server';
import { prisma } from '../app/db';
import {
  getPaginatedResponse,
  parsePaginationRequest,
} from '../app/middleware';
import {
  getAirlineSchema,
  getAirlinesSchema,
  searchSchema,
} from '../app/schemas';
import { publicProcedure, router } from '../app/trpc';

export const airlinesRouter = router({
  getAirlines: publicProcedure
    .input(getAirlinesSchema)
    .query(async ({ input }) => {
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const { sort, sortKey } = input;
      try {
        const [results, itemCount] = await prisma.$transaction([
          prisma.airline.findMany({
            skip,
            take,
            orderBy:
              sortKey !== null
                ? {
                    [sortKey as string]: sort ?? 'asc',
                  }
                : undefined,
          }),
          prisma.airline.count(),
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
  searchAirlines: publicProcedure
    .input(searchSchema)
    .query(async ({ input }) => {
      const { query } = input;
      try {
        const airlines = await prisma.airline.findMany({
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
        return airlines;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  getAirline: publicProcedure
    .input(getAirlineSchema)
    .query(async ({ input }) => {
      const { id } = input;
      try {
        const airline = await prisma.airline.findUnique({
          where: {
            id,
          },
        });
        if (airline === null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Airline not found.',
          });
        }
        return airline;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
});
