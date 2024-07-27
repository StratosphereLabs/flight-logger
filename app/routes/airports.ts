import { prisma } from '../db';
import { searchSchema } from '../schemas/search';
import { procedure, router } from '../trpc';
import { getAirportsSchema } from '../schemas';
import { getPaginatedResponse, parsePaginationRequest } from '../utils';

export const airportsRouter = router({
  getAirports: procedure.input(getAirportsSchema).query(async ({ input }) => {
    const { limit, page, skip, take } = parsePaginationRequest(input);
    const { sort, sortKey } = input;
    const [results, itemCount] = await prisma.$transaction([
      prisma.airport.findMany({
        skip,
        take,
        orderBy:
          sortKey !== undefined
            ? {
                [sortKey]: sort ?? 'asc',
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
  }),
  searchAirports: procedure.input(searchSchema).query(async ({ input }) => {
    const { query } = input;
    const [codeMatches, allMatches] = await prisma.$transaction([
      prisma.airport.findMany({
        take: 5,
        where: {
          OR: [
            {
              iata: query.toUpperCase(),
            },
            {
              id: query.toUpperCase(),
            },
          ],
        },
      }),
      prisma.airport.findMany({
        take: 5,
        where: {
          OR: [
            {
              iata: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              municipality: {
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
