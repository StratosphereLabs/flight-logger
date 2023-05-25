import { TRPCError } from '@trpc/server';
import difference from 'lodash.difference';
import { prisma, validateUserFlights } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  createTripSchema,
  deleteTripSchema,
  editTripSchema,
  getTripSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import { transformTripData } from '../utils';

export const tripsRouter = router({
  getTrip: procedure.input(getTripSchema).query(async ({ input }) => {
    const { id } = input;
    const trip = await prisma.trip.findUnique({
      where: {
        id,
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
    return transformTripData(trip);
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
          },
        },
      });
      if (trip === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip could not be found!',
        });
      }
      const flights = await validateUserFlights(flightIds, ctx.user.id);
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
          outTime: flights[0].outTime,
          inTime: flights[flights.length - 1].inTime,
          name,
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
      return transformTripData(deletedTrip);
    }),
});
