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
  getHeatmap,
  getRoutes,
  transformFlightData,
  transformItineraryData,
  transformTripData,
  getCenterpoint,
} from '../utils';

export const usersRouter = router({
  getUser: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
    if (input.username === undefined && ctx.user === null) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const [userData, completedFlightCount, upcomingFlightCount] =
      await prisma.$transaction([
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
            inTime: {
              lte: new Date(),
            },
          },
        }),
        prisma.flight.count({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              gt: new Date(),
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
      completedFlightCount,
      upcomingFlightCount,
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
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const includeObj = {
        user: true,
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
        aircraftType: true,
        airframe: {
          include: {
            operator: true,
          },
        },
      };
      const [upcomingFlights, currentFlights, completedFlights] =
        await prisma.$transaction([
          prisma.flight.findMany({
            where: {
              user: {
                username: input?.username ?? ctx.user?.username,
              },
              tripId: input?.withTrip === false ? null : undefined,
              outTime: {
                gt: new Date(),
              },
            },
            include: includeObj,
            orderBy: {
              outTime: input.layout === 'full' ? 'asc' : 'desc',
            },
          }),
          prisma.flight.findMany({
            where: {
              user: {
                username: input?.username ?? ctx.user?.username,
              },
              tripId: input?.withTrip === false ? null : undefined,
              inTime: {
                gt: new Date(),
              },
              outTime: {
                lte: new Date(),
              },
            },
            include: includeObj,
            orderBy: {
              outTime: input.layout === 'full' ? 'asc' : 'desc',
            },
          }),
          prisma.flight.findMany({
            where: {
              user: {
                username: input?.username ?? ctx.user?.username,
              },
              tripId: input?.withTrip === false ? null : undefined,
              inTime: {
                lte: new Date(),
              },
            },
            include: includeObj,
            orderBy: {
              outTime: 'desc',
            },
          }),
        ]);
      return {
        upcomingFlights: upcomingFlights.map(transformFlightData),
        currentFlights: currentFlights.map(transformFlightData),
        completedFlights: completedFlights.map(transformFlightData),
        total:
          upcomingFlights.length +
          currentFlights.length +
          completedFlights.length,
      };
    }),
  getUserMapData: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
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
    if (input.username === undefined && ctx.user === null) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const includeObj = {
      user: true,
      flights: {
        include: {
          user: true,
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
          outTime: 'asc' as const,
        },
      },
    };
    const [upcomingTrips, currentTrips, completedTrips] =
      await prisma.$transaction([
        prisma.trip.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            outTime: {
              gt: new Date(),
            },
          },
          include: includeObj,
          orderBy: {
            outTime: 'asc',
          },
        }),
        prisma.trip.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              gt: new Date(),
            },
            outTime: {
              lte: new Date(),
            },
          },
          include: includeObj,
          orderBy: {
            outTime: 'asc',
          },
        }),
        prisma.trip.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              lte: new Date(),
            },
          },
          include: includeObj,
          orderBy: {
            outTime: 'desc',
          },
        }),
      ]);
    return {
      upcomingTrips: upcomingTrips.map(transformTripData),
      currentTrips: currentTrips.map(transformTripData),
      completedTrips: completedTrips.map(transformTripData),
      total: upcomingTrips.length + currentTrips.length + completedTrips.length,
    };
  }),
  getUserItineraries: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
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
