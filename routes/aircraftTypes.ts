import { TRPCError } from '@trpc/server';
import { prisma } from '../app/db';
import {
  getPaginatedResponse,
  parsePaginationRequest,
} from '../app/middleware';
import { getAircraftTypeSchema, getAircraftTypesSchema } from '../app/schemas';
import { searchSchema } from '../app/schemas/search';
import { publicProcedure, router } from '../app/trpc';

export const aircraftTypesRouter = router({
  getAircraftTypes: publicProcedure
    .input(getAircraftTypesSchema)
    .query(async ({ input }) => {
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const { sort, sortKey } = input;
      try {
        const [results, itemCount] = await prisma.$transaction([
          prisma.aircraft_type.findMany({
            skip,
            take,
            orderBy:
              sortKey !== null
                ? {
                    [sortKey as string]: sort ?? 'asc',
                  }
                : undefined,
          }),
          prisma.aircraft_type.count(),
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
  searchAircraft: publicProcedure
    .input(searchSchema)
    .query(async ({ input }) => {
      const { query } = input;
      try {
        const aircraftTypes = await prisma.aircraft_type.findMany({
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
        return aircraftTypes;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  getAircraftType: publicProcedure
    .input(getAircraftTypeSchema)
    .query(async ({ input }) => {
      const { id } = input;
      try {
        const aircraftType = await prisma.aircraft_type.findUnique({
          where: {
            id,
          },
        });
        if (aircraftType === null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aircraft Type not found.',
          });
        }
        return aircraftType;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
});
