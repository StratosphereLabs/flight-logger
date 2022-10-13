import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { getAircraftTypeSchema, getAircraftTypesSchema } from '../schemas';
import { searchSchema } from '../schemas/search';
import { procedure, router } from '../trpc';
import { getPaginatedResponse, parsePaginationRequest } from '../utils';

export const aircraftTypesRouter = router({
  getAircraftTypes: procedure
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
              sortKey !== undefined
                ? {
                    [sortKey]: sort ?? 'asc',
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
  searchAircraft: procedure.input(searchSchema).query(async ({ input }) => {
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
  getAircraftType: procedure
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
