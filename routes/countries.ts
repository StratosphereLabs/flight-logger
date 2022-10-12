import { TRPCError } from '@trpc/server';
import { prisma } from '../app/db';
import {
  getPaginatedResponse,
  parsePaginationRequest,
} from '../app/middleware';
import { publicProcedure, router } from '../app/trpc';
import {
  getCountriesSchema,
  getCountrySchema,
  searchSchema,
} from '../app/schemas';

export const countriesRouter = router({
  getCountries: publicProcedure
    .input(getCountriesSchema)
    .query(async ({ input }) => {
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const { sort, sortKey } = input;
      try {
        const [results, itemCount] = await prisma.$transaction([
          prisma.country.findMany({
            skip,
            take,
            orderBy:
              sortKey !== null
                ? {
                    [sortKey as string]: sort ?? 'asc',
                  }
                : undefined,
          }),
          prisma.country.count(),
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
  searchCountries: publicProcedure
    .input(searchSchema)
    .query(async ({ input }) => {
      const { query } = input;
      try {
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
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  getCountry: publicProcedure
    .input(getCountrySchema)
    .query(async ({ input }) => {
      const { id } = input;
      try {
        const country = await prisma.country.findUnique({
          where: {
            id,
          },
        });
        if (country === null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Country not found.',
          });
        }
        return country;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
});
