import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC, verifyAuthenticated } from '../middleware';
import { getAirports, getRoutes } from '../parsers';
import {
  addFlightSchema,
  deleteFlightSchema,
  getUserSchema,
  getUsersSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  excludeKeys,
  fetchGravatarUrl,
  getDurationString,
  getFlightTimestamps,
} from '../utils';

export const usersRouter = router({
  getUser: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
    const [userData, flightCount] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          username: input.username ?? ctx.user?.username,
        },
      }),
      prisma.flight.count({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
        },
      }),
    ]);
    if (userData === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      });
    }
    return {
      avatar: fetchGravatarUrl(userData.email),
      flightCount,
      ...excludeKeys(
        userData,
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      ),
    };
  }),
  getUserFlights: procedure
    .input(getUserSchema.optional())
    .query(async ({ ctx, input }) => {
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
      return flights.map(flight => ({
        ...flight,
        duration: getDurationString(flight.duration),
      }));
    }),
  getUserMapData: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
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
    }),
  getUsers: procedure
    .use(verifyAdminTRPC)
    .input(getUsersSchema)
    .query(async ({ input }) => {
      const results = await prisma.user.findMany({
        take: 5,
        where: {
          username: {
            contains: input.query,
            mode: 'insensitive',
          },
        },
      });
      return results;
    }),
  addFlight: procedure
    .use(verifyAuthenticated)
    .input(addFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const [departureAirport, arrivalAirport] = await prisma.$transaction([
        prisma.airport.findUnique({
          where: {
            id: input.departureAirportId,
          },
        }),
        prisma.airport.findUnique({
          where: {
            id: input.arrivalAirportId,
          },
        }),
      ]);
      if (departureAirport === null || arrivalAirport === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Airport not found.',
        });
      }
      const { outTime, offTime, onTime, inTime, duration } =
        getFlightTimestamps({
          departureAirport,
          arrivalAirport,
          outDate: input.outDate,
          outTime: input.outTime,
          offTime: input.offTime,
          onTime: input.onTime,
          inTime: input.inTime,
        });
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
          outTime: outTime.toISOString(),
          offTime: offTime?.toISOString() ?? null,
          onTime: onTime?.toISOString() ?? null,
          inTime: inTime.toISOString(),
          duration,
          class: input.class,
          seatNumber: input.seatNumber,
          seatPosition: input.seatPosition,
          reason: input.reason,
          comments: input.comments,
          trackingLink: input.trackingLink,
        },
      });
      return flight;
    }),
  deleteFlight: procedure
    .use(verifyAuthenticated)
    .input(deleteFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
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
    }),
});
