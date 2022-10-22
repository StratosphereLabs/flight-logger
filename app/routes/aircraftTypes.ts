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
    }),
  searchAircraft: procedure.input(searchSchema).query(async ({ input }) => {
    const { query } = input;
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
  }),
  getAircraftType: procedure
    .input(getAircraftTypeSchema)
    .query(async ({ input }) => {
      const { id } = input;
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
    }),
});
