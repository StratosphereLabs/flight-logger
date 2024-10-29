import { prisma } from '../db';
import { getAirlinesSchema, searchSchema } from '../schemas';
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
    const [codeMatches, allMatches] = await prisma.$transaction([
      prisma.airline.findMany({
        take: 5,
        where: {
          OR: [
            {
              iata: query.toUpperCase(),
            },
            {
              icao: query.toUpperCase(),
            },
          ],
        },
      }),
      prisma.airline.findMany({
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
      }),
    ]);
    return [
      ...codeMatches,
      ...allMatches.filter(({ id }) =>
        codeMatches.every(match => match.id !== id),
      ),
    ].slice(0, 5);
  }),
});
