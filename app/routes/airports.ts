import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { searchSchema } from '../schemas/search';
import { procedure, router } from '../trpc';
import { getAirportSchema, getAirportsSchema } from '../schemas';
import {
  filterCustomDates,
  getFromDate,
  getFromStatusDate,
  getPaginatedResponse,
  getToDate,
  getToStatusDate,
  parsePaginationRequest,
} from '../utils';

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
  getAirport: procedure
    .input(getAirportSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input;
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const username = input?.username ?? ctx.user?.username;
      const fromDate = getFromDate(input);
      const toDate = getToDate(input);
      const fromStatusDate = getFromStatusDate(input);
      const toStatusDate = getToStatusDate(input);
      const airport = await prisma.airport.findUnique({
        where: {
          id,
        },
        include: {
          departureFlights: {
            where: {
              user: {
                username,
              },
              outTime: {
                gte: fromDate,
                lte: toDate,
              },
              OR:
                fromStatusDate !== undefined || toStatusDate !== undefined
                  ? [
                      {
                        inTime: {
                          gte: fromStatusDate,
                          lte: toStatusDate,
                        },
                      },
                      {
                        inTimeActual: {
                          gte: fromStatusDate,
                          lte: toStatusDate,
                        },
                      },
                    ]
                  : undefined,
            },
            select: {
              departureAirport: {
                select: {
                  timeZone: true,
                },
              },
              outTime: true,
            },
          },
          arrivalFlights: {
            where: {
              user: {
                username,
              },
              outTime: {
                gte: fromDate,
                lte: toDate,
              },
              OR:
                fromStatusDate !== undefined || toStatusDate !== undefined
                  ? [
                      {
                        inTime: {
                          gte: fromStatusDate,
                          lte: toStatusDate,
                        },
                      },
                      {
                        inTimeActual: {
                          gte: fromStatusDate,
                          lte: toStatusDate,
                        },
                      },
                    ]
                  : undefined,
            },
            select: {
              departureAirport: {
                select: {
                  timeZone: true,
                },
              },
              outTime: true,
            },
          },
        },
      });
      if (airport === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Airport not found.',
        });
      }
      const numFlights = [
        ...airport.arrivalFlights,
        ...airport.departureFlights,
      ].filter(filterCustomDates(input)).length;
      return {
        ...airport,
        numFlights,
      };
    }),
});
