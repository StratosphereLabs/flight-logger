import { prisma } from '../db';
import { procedure, router } from '../trpc';
import { getCountriesSchema, searchSchema } from '../schemas';
import { getPaginatedResponse, parsePaginationRequest } from '../utils';

export const countriesRouter = router({
  getCountries: procedure.input(getCountriesSchema).query(async ({ input }) => {
    const { limit, page, skip, take } = parsePaginationRequest(input);
    const { sort, sortKey } = input;
    const [results, itemCount] = await prisma.$transaction([
      prisma.country.findMany({
        skip,
        take,
        orderBy:
          sortKey !== undefined
            ? {
                [sortKey]: sort ?? 'asc',
              }
            : undefined,
        cacheStrategy: {
          ttl: 30 * 24 * 60 * 60,
        },
      }),
      prisma.country.count({
        cacheStrategy: {
          ttl: 30 * 24 * 60 * 60,
        },
      }),
    ]);
    return getPaginatedResponse({
      itemCount,
      limit,
      page,
      results,
    });
  }),
  searchCountries: procedure.input(searchSchema).query(async ({ input }) => {
    const { query } = input;
    const countries = await prisma.country.findMany({
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
    return countries;
  }),
});
