import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import {
  excludeKeys,
  fetchGravatarUrl,
  getPaginatedResponse,
  parsePaginationRequest,
} from '../utils';
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from '../trpc';
import { addFlightSchema, getUserSchema, getUsersSchema } from '../schemas';
import { getAirports, getRoutes } from '../parsers';
import { z } from 'zod';

export const usersRouter = router({
  getProfile: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
    const userId = ctx.user.id;
    try {
      const result = await prisma.user.findUnique({
        where: {
          id: userId,
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
  getUser: publicProcedure.input(getUserSchema).query(async ({ input }) => {
    const { username } = input;
    try {
      const result = await prisma.user.findUnique({
        where: {
          username,
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
  getUserFlights: publicProcedure
    .input(getUserSchema)
    .query(async ({ input }) => {
      const { username } = input;
      try {
        const flights = await prisma.flight.findMany({
          where: {
            user: {
              username,
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
  getUserMapData: publicProcedure
    .input(getUserSchema)
    .query(async ({ input }) => {
      const { username } = input;
      try {
        const flights = await prisma.flight.findMany({
          where: {
            user: {
              username,
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
  getUsers: adminProcedure.input(getUsersSchema).query(async ({ input }) => {
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
  addFlight: protectedProcedure
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
});
