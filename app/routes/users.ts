import { inferRouterOutputs, TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { DATE_FORMAT_MONTH } from '../constants';
import { prisma } from '../db';
import { getUserSchema, getUsersSchema } from '../schemas';
import { procedure, router } from '../trpc';
import {
  calculateDistance,
  excludeKeys,
  fetchGravatarUrl,
  getAirports,
  getFlightTimeData,
  getHeatmap,
  getRoutes,
  ItineraryResult,
  transformTripData,
} from '../utils';

export const usersRouter = router({
  getUser: procedure
    .input(getUserSchema.optional())
    .query(async ({ ctx, input }) => {
      const [userData, flightCount] = await prisma.$transaction([
        prisma.user.findUnique({
          where: {
            username: input?.username ?? ctx.user?.username,
          },
        }),
        prisma.flight.count({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            outTime: {
              lt: new Date(),
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
        creationDate: format(userData.createdAt, DATE_FORMAT_MONTH),
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
      const result = await prisma.flight.findMany({
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
      return getFlightTimeData(result);
    }),
  getUserMapData: procedure
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
        },
      });
      const airports = getAirports(flights);
      const routes = getRoutes(flights);
      const heatmap = getHeatmap(flights);
      return {
        airports,
        heatmap,
        routes,
      };
    }),
  getUserTrips: procedure
    .input(getUserSchema.optional())
    .query(async ({ ctx, input }) => {
      const trips = await prisma.trip.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
        },
        include: {
          flights: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
              airline: true,
              aircraftType: true,
            },
          },
        },
      });
      return trips.map(transformTripData);
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
