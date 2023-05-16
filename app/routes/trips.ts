import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC, verifyAuthenticated } from '../middleware';
import { createTripSchema, getTripSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const tripsRouter = router({
  getTrip: procedure.input(getTripSchema).query(async ({ input }) => {
    const { id } = input;
    const trip = await prisma.trip.findUnique({
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
    return trip;
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
  deleteTrips: procedure.use(verifyAdminTRPC).mutation(async () => {
    await prisma.trip.deleteMany({});
  }),
});
