import { prisma } from '../db';
import { getAircraftTypesSchema } from '../schemas';
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
        prisma.aircraftType.findMany({
          skip,
          take,
          orderBy:
            sortKey !== undefined
              ? {
                  [sortKey]: sort ?? 'asc',
                }
              : undefined,
        }),
        prisma.aircraftType.count(),
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
    const [codeMatches, allMatches] = await prisma.$transaction([
      prisma.aircraftType.findMany({
        take: 5,
        where: {
          OR: [
            {
              icao: query.toUpperCase(),
            },
            {
              iata: query.toUpperCase(),
            },
          ],
        },
      }),
      prisma.aircraftType.findMany({
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
