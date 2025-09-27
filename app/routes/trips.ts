import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import difference from 'lodash.difference';

import { prisma, validateUserFlights } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  createTripSchema,
  deleteTripSchema,
  editTripSchema,
  getTripSchema,
  getUserSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import { transformTripData, tripIncludeObj } from '../utils';

export const tripsRouter = router({
  getTrip: procedure
    .use(verifyAuthenticated)
    .input(getTripSchema)
    .query(async ({ input }) => {
      const { id } = input;
      const trip = await prisma.trip.findUnique({
        where: {
          id,
        },
        include: tripIncludeObj,
      });
      if (trip === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found.',
        });
      }
      return transformTripData(trip);
    }),
  getUserTrips: procedure
    .use(verifyAuthenticated)
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
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
            include: tripIncludeObj,
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
            include: tripIncludeObj,
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
            include: tripIncludeObj,
            orderBy: {
              outTime: 'desc',
            },
          }),
        ]);
      return {
        upcomingTrips: upcomingTrips.map(transformTripData),
        currentTrips: currentTrips.map(transformTripData),
        completedTrips: completedTrips.map(transformTripData),
        total:
          upcomingTrips.length + currentTrips.length + completedTrips.length,
      };
    }),
  createTrip: procedure
    .use(verifyAuthenticated)
    .input(createTripSchema)
    .mutation(async ({ ctx, input }) => {
      const { flightIds, name } = input;
      const flights = await validateUserFlights(flightIds, ctx.user.id);
      const trip = await prisma.trip.create({
        data: {
          userId: ctx.user.id,
          outTime: flights[0].outTime,
          inTime: flights[flights.length - 1].inTime,
          name,
        },
      });
      await prisma.flight.updateMany({
        where: {
          id: {
            in: flightIds,
          },
        },
        data: {
          tripId: trip.id,
        },
      });
      const updatedTrip = await prisma.trip.findUnique({
        where: {
          id: trip.id,
        },
        include: tripIncludeObj,
      });
      if (updatedTrip === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found.',
        });
      }
      return transformTripData(updatedTrip);
    }),
  editTrip: procedure
    .use(verifyAuthenticated)
    .input(editTripSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, flightIds, name } = input;
      const trip = await prisma.trip.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
        include: {
          flights: {
            select: {
              id: true,
            },
            orderBy: {
              outTime: 'asc',
            },
          },
        },
      });
      if (trip === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip could not be found!',
        });
      }
      await validateUserFlights(flightIds, ctx.user.id);
      const currentFlightIds = trip.flights.map(({ id }) => id);
      const flightIdsToRemove = difference(currentFlightIds, flightIds);
      await prisma.$transaction([
        prisma.flight.updateMany({
          where: {
            id: {
              in: flightIdsToRemove,
            },
          },
          data: {
            tripId: null,
          },
        }),
        prisma.flight.updateMany({
          where: {
            id: {
              in: flightIds,
            },
          },
          data: {
            tripId: id,
          },
        }),
      ]);
      const updatedTrip = await prisma.trip.update({
        where: {
          id,
        },
        data: {
          name,
        },
        include: tripIncludeObj,
      });
      return transformTripData(updatedTrip);
    }),
  deleteTrip: procedure
    .use(verifyAuthenticated)
    .input(deleteTripSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const trip = await prisma.trip.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
      });
      if (trip === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found.',
        });
      }
      const deletedTrip = await prisma.trip.delete({
        where: {
          id,
        },
        include: tripIncludeObj,
      });
      return transformTripData(deletedTrip);
    }),
});

export type TripsRouter = typeof tripsRouter;

export type TripsRouterOutput = inferRouterOutputs<TripsRouter>;
