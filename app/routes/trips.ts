import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import { createTripSchema, deleteTripSchema, getTripSchema } from '../schemas';
import { procedure, router } from '../trpc';
import { getFlightTimeData } from '../utils';

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
    if (trip === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Trip not found.',
      });
    }
    return {
      ...trip,
      flights: getFlightTimeData(trip.flights),
    };
  }),
  createTrip: procedure
    .use(verifyAuthenticated)
    .input(createTripSchema)
    .mutation(async ({ ctx, input }) => {
      const { flightIds, name } = input;
      const flights = await prisma.flight.findMany({
        where: {
          id: {
            in: flightIds,
          },
        },
      });
      if (flights.length !== flightIds.length) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'One or more flights could not be found!',
        });
      }
      flights.forEach(flight => {
        if (flight.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'One or more flights does not belong to current user.',
          });
        }
        if (flight.tripId !== null) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or more flights already belongs to a trip.',
          });
        }
      });
      const trip = await prisma.trip.create({
        data: {
          userId: ctx.user.id,
          name,
        },
      });
      return await prisma.flight.updateMany({
        where: {
          id: {
            in: flightIds,
          },
        },
        data: {
          tripId: trip.id,
        },
      });
    }),
  deleteTrip: procedure
    .use(verifyAuthenticated)
    .input(deleteTripSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const trip = await prisma.trip.findFirst({
        where: {
          id,
        },
      });
      if (trip === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found.',
        });
      }
      if (trip.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unable to delete trip.',
        });
      }
      return await prisma.trip.delete({
        where: {
          id,
        },
      });
    }),
});
