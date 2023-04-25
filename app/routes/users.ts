import { inferRouterOutputs, TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { getAirports, getRoutes } from '../parsers';
import { ItineraryResult } from '../parsers/itineraries';
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
        const flightDistance = calculateDistance(
          flight.departureAirport.lat,
          flight.departureAirport.lon,
          flight.arrivalAirport.lat,
          flight.arrivalAirport.lon,
        );
        return {
          ...flight,
          flightNumberString:
            flight.flightNumber !== null
              ? `${flight.airline?.iata ?? ''} ${flight.flightNumber}`.trim()
              : '',
          duration,
          inFuture,
          outDateISO,
          outDateLocal,
          outTimeLocal,
          outTimeValue,
          inTimeLocal,
          inTimeValue,
          distance: Math.round(flightDistance),
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
  getUserItineraries: procedure
    .input(getUserSchema.optional())
    .query(async ({ ctx, input }) => {
      const itineraries = await prisma.itinerary.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
        },
      });
      return itineraries.map(({ flights, ...itinerary }) => {
        const itineraryFlights = JSON.parse(flights) as ItineraryResult[];
        const flightsWithDistance = itineraryFlights.map(flight => ({
          ...flight,
          distance: calculateDistance(
            flight.departureAirport.lat,
            flight.departureAirport.lon,
            flight.arrivalAirport.lat,
            flight.arrivalAirport.lon,
          ),
        }));
        const totalDistance = flightsWithDistance.reduce(
          (acc, { distance }) => acc + distance,
          0,
        );
        return {
          ...itinerary,
          flights: flightsWithDistance,
          distance: Math.round(totalDistance),
          numFlights: itineraryFlights.length,
          date: itineraryFlights[0].outDate,
        };
      });
    }),
  getUsers: procedure.input(getUsersSchema).query(async ({ input }) => {
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
