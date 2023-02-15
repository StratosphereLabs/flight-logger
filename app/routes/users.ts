import { inferRouterOutputs, TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC } from '../middleware';
import { getAirports, getRoutes } from '../parsers';
import { getUserSchema, getUsersSchema } from '../schemas';
import { procedure, router } from '../trpc';
import {
  calculateDistance,
  excludeKeys,
  fetchGravatarUrl,
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
      return flights.map(flight => {
        const {
          duration,
          inFuture,
          outDateISO,
          outDateLocal,
          outTimeLocal,
          outTimeValue,
          inTimeLocal,
          inTimeValue,
        } = getFlightTimestamps({
          departureAirport: flight.departureAirport,
          arrivalAirport: flight.arrivalAirport,
          duration: flight.duration,
          outTime: flight.outTime,
          inTime: flight.inTime,
        });
        return {
          ...flight,
          flightNumberString: `${flight.airline?.iata ?? ''} ${
            flight.flightNumber ?? ''
          }`.trim(),
          duration,
          inFuture,
          outDateISO,
          outDateLocal,
          outTimeLocal,
          outTimeValue,
          inTimeLocal,
          inTimeValue,
          distance: calculateDistance(
            flight.departureAirport.lat,
            flight.departureAirport.lon,
            flight.arrivalAirport.lat,
            flight.arrivalAirport.lon,
          ),
        };
      });
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
});

export type UsersRouter = typeof usersRouter;

export type UsersRouterOutput = inferRouterOutputs<UsersRouter>;
