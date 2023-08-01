import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { DATE_FORMAT_MONTH } from '../constants';
import { prisma } from '../db';
import {
  getUserFlightsSchema,
  getUserSchema,
  getUsersSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  excludeKeys,
  fetchGravatarUrl,
  getFlightTimeData,
  getHeatmap,
  transformItineraryData,
  getRoutes,
  transformTripData,
  getCenterpoint,
} from '../utils';

export const usersRouter = router({
  getUser: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
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
    .input(getUserFlightsSchema)
    .query(async ({ ctx, input }) => {
      const result = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          tripId: input?.withTrip === false ? null : undefined,
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
          aircraftType: true,
          airframe: {
            include: {
              operator: true,
            },
          },
        },
        orderBy: {
          outTime: 'desc',
        },
      });
      return getFlightTimeData(result);
    }),
  getUserMapData: procedure
    .input(getUserSchema)
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
      return {
        centerpoint: getCenterpoint(flights),
        heatmap: getHeatmap(flights),
        routes: getRoutes(flights),
      };
    }),
  getUserTrips: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
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
            airframe: {
              include: {
                operator: true,
              },
            },
          },
          orderBy: {
            outTime: 'asc',
          },
        },
      },
      orderBy: {
        outTime: 'desc',
      },
    });
    return trips.map(transformTripData);
  }),
  getUserItineraries: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      const itineraries = await prisma.itinerary.findMany({
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
            orderBy: {
              outTime: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return itineraries.map(transformItineraryData);
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
