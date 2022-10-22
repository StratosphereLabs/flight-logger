import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC, verifyAuthenticated } from '../middleware';
import {
  excludeKeys,
  fetchGravatarUrl,
  getPaginatedResponse,
  parsePaginationRequest,
} from '../utils';
import { procedure, router } from '../trpc';
import {
  addFlightSchema,
  deleteFlightSchema,
  getUserSchema,
  paginationSchema,
} from '../schemas';
import { getAirports, getRoutes } from '../parsers';

export const usersRouter = router({
  getUser: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
    try {
      const result = await prisma.user.findUnique({
        where: {
          username: input.username ?? ctx.user?.username,
        },
      });
      if (result === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }
      return {
        avatar: fetchGravatarUrl(result.email),
        ...excludeKeys(
          result,
          'password',
          'id',
          'passwordResetToken',
          'passwordResetAt',
        ),
      };
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
        cause: err,
      });
    }
  }),
  getUserFlights: procedure
    .input(getUserSchema.optional())
    .query(async ({ ctx, input }) => {
      try {
        const flights = await prisma.flight.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
          },
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airline: true,
            aircraftType: true,
          },
          orderBy: [
            {
              outTime: 'desc',
            },
          ],
        });
        return flights;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  getUserMapData: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      try {
        const flights = await prisma.flight.findMany({
          where: {
            user: {
              username: input.username ?? ctx.user?.username,
            },
          },
          include: {
            departureAirport: true,
            arrivalAirport: true,
          },
        });
        const airports = getAirports(flights);
        const routes = getRoutes(flights);
        return {
          airports,
          routes,
        };
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  getUsers: procedure
    .use(verifyAdminTRPC)
    .input(paginationSchema)
    .query(async ({ input }) => {
      const { limit, page, skip, take } = parsePaginationRequest(input);
      try {
        const [results, itemCount] = await prisma.$transaction([
          prisma.user.findMany({
            skip,
            take,
          }),
          prisma.user.count(),
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
  addFlight: procedure
    .use(verifyAuthenticated)
    .input(addFlightSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const flight = await prisma.flight.create({
          data: {
            user: {
              connect: {
                id: ctx.user.id,
              },
            },
            departureAirport: {
              connect: {
                id: input.departureAirportId,
              },
            },
            arrivalAirport: {
              connect: {
                id: input.arrivalAirportId,
              },
            },
            airline:
              input.airlineId !== null && input.airlineId !== ''
                ? {
                    connect: {
                      id: input.airlineId,
                    },
                  }
                : undefined,
            aircraftType:
              input.aircraftTypeId !== null && input.aircraftTypeId !== ''
                ? {
                    connect: {
                      id: input.aircraftTypeId,
                    },
                  }
                : undefined,
            flightNumber: input.flightNumber,
            callsign: input.callsign,
            tailNumber: input.tailNumber,
            outTime: `${input.outDate} ${input.outTime ?? ''}`.trim(),
            offTime: input.offTime,
            onTime: input.inTime,
            inTime: input.inTime,
            class: input.class,
            seatNumber: input.seatNumber,
            seatPosition: input.seatPosition,
            reason: input.reason,
            comments: input.comments,
            trackingLink: input.trackingLink,
          },
        });
        return flight;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
  deleteFlight: procedure
    .use(verifyAuthenticated)
    .input(deleteFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      try {
        const flight = await prisma.flight.findUnique({
          where: {
            id,
          },
        });
        if (flight?.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Unable to delete flight.',
          });
        }
        return await prisma.flight.delete({
          where: {
            id,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          cause: err,
        });
      }
    }),
});
