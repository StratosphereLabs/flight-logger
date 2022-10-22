import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { getAirlineSchema, getAirlinesSchema, searchSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { getPaginatedResponse, parsePaginationRequest } from '../utils';

export const airlinesRouter = router({
  getAirlines: procedure.input(getAirlinesSchema).query(async ({ input }) => {
    const { limit, page, skip, take } = parsePaginationRequest(input);
    const { sort, sortKey } = input;
    const [results, itemCount] = await prisma.$transaction([
      prisma.airline.findMany({
        skip,
        take,
        orderBy:
          sortKey !== undefined
            ? {
                [sortKey]: sort ?? 'asc',
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
  }),
  searchAirlines: procedure.input(searchSchema).query(async ({ input }) => {
    const { query } = input;
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
  }),
  getAirline: procedure.input(getAirlineSchema).query(async ({ input }) => {
    const { id } = input;
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
  }),
});
